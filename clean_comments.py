import re
from pathlib import Path

def is_section_marker(comment_text):
    """
    Determine if a comment is a section block marker.
    Section markers typically contain:
    - Only dashes/equals: '---', '===', '====', etc.
    - Simple section names: 'HEADER', 'Hero Section', etc.
    - Format with dashes: '--- SECTION NAME ---'
    
    Detailed annotations typically contain:
    - Colons followed by descriptions: 'Slide 1: Description'
    - Vietnamese text explaining functionality
    - Multiple sentences or phrases
    """
    text = comment_text.strip()
    
    # Remove leading/trailing whitespace and special chars
    text = text.strip(' \t')
    
    # If it's only dashes, equals, or underscores - it's a marker
    if re.match(r'^[\-=_\s]*$', text):
        return True
    
    # If it matches pattern like '--- TEXT ---' or '=== TEXT ===' - it's a marker
    if re.match(r'^[\-=_]+\s+[A-Z\s&]+\s+[\-=_]+$', text, re.IGNORECASE):
        return True
    
    # Simple section names (usually all caps or Title Case with no colons)
    # Examples: "HEADER", "Hero Section", "About Section", "Navigation"
    if not ':' in text and len(text) < 50:
        # Check if it looks like a section header (no lowercase words with special chars)
        if re.match(r'^[A-Z][A-Za-z\s&\-()]*$', text):
            return True
    
    # Colons usually indicate detailed annotations
    if ':' in text:
        return False
    
    # If contains Vietnamese text and is longer, likely annotation
    if len(text) > 40 and re.search(r'[\u0100-\uFFFF]', text):
        return False
    
    # Default: short text without special descriptive patterns = marker
    if len(text) < 40:
        return True
    
    return False

def clean_html(content):
    """Remove annotation comments from HTML, keep section markers."""
    removed_comments = []
    kept_comments = []
    
    def replace_comment(match):
        comment_text = match.group(1)
        if is_section_marker(comment_text):
            kept_comments.append(comment_text.strip())
            return match.group(0)  # Keep it
        else:
            removed_comments.append(comment_text.strip())
            return ''  # Remove it
    
    result = re.sub(r'<!--\s*(.*?)\s*-->', replace_comment, content, flags=re.DOTALL)
    return result, removed_comments, kept_comments

def clean_css(content):
    """Remove annotation comments from CSS, keep section markers."""
    removed_comments = []
    kept_comments = []
    
    def replace_comment(match):
        comment_text = match.group(1)
        if is_section_marker(comment_text):
            kept_comments.append(comment_text.strip())
            return match.group(0)  # Keep it
        else:
            removed_comments.append(comment_text.strip())
            return ''  # Remove it
    
    result = re.sub(r'/\*\s*(.*?)\s*\*/', replace_comment, content, flags=re.DOTALL)
    return result, removed_comments, kept_comments

def clean_js(content):
    """Remove annotation comments from JavaScript, keep section markers."""
    removed_comments = []
    kept_comments = []
    lines = content.split('\n')
    result_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check for block comments /* */
        if '/*' in line:
            # Find the full comment block
            comment_start = line.find('/*')
            if '*/' in line[comment_start:]:
                # Single line block comment
                comment_end = line.find('*/', comment_start) + 2
                comment_text = line[comment_start+2:line.find('*/', comment_start)]
                
                if is_section_marker(comment_text):
                    kept_comments.append(comment_text.strip())
                    result_lines.append(line)
                else:
                    removed_comments.append(comment_text.strip())
                    # Remove comment but keep the rest of the line
                    before = line[:comment_start]
                    after = line[comment_end:]
                    new_line = before + after
                    if new_line.strip():
                        result_lines.append(new_line)
            else:
                # Multi-line block comment
                comment_lines = [line[comment_start+2:]]
                i += 1
                while i < len(lines):
                    comment_lines.append(lines[i])
                    if '*/' in lines[i]:
                        comment_end_pos = lines[i].find('*/')
                        comment_lines[-1] = lines[i][:comment_end_pos]
                        break
                    i += 1
                
                comment_text = '\n'.join(comment_lines)
                if is_section_marker(comment_text):
                    kept_comments.append(comment_text.strip())
                    result_lines.extend(comment_lines)
                else:
                    removed_comments.append(comment_text.strip())
        
        # Check for line comments //
        elif '//' in line:
            comment_pos = line.find('//')
            # Make sure it's not in a string
            before = line[:comment_pos]
            comment_text = line[comment_pos+2:]
            
            if is_section_marker(comment_text):
                kept_comments.append(comment_text.strip())
                result_lines.append(line)
            else:
                removed_comments.append(comment_text.strip())
                # Keep code before comment
                if before.strip():
                    result_lines.append(before)
        else:
            result_lines.append(line)
        
        i += 1
    
    result = '\n'.join(result_lines)
    return result, removed_comments, kept_comments

# Process files
files_to_clean = [
    'index.html',
    'css/home.css',
    'js/home.js'
]

all_removed = {}
all_kept = {}

for file_path in files_to_clean:
    full_path = Path(file_path)
    if not full_path.exists():
        print(f'❌ File not found: {file_path}')
        continue
    
    print(f'\n📄 Processing: {file_path}')
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Determine file type and clean accordingly
    if file_path.endswith('.html'):
        cleaned, removed, kept = clean_html(content)
    elif file_path.endswith('.css'):
        cleaned, removed, kept = clean_css(content)
    elif file_path.endswith('.js'):
        cleaned, removed, kept = clean_js(content)
    else:
        print(f'⚠️ Unknown file type: {file_path}')
        continue
    
    # Write cleaned content back
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    
    all_removed[file_path] = removed
    all_kept[file_path] = kept
    
    print(f'✅ Cleaned! Removed {len(removed)} comments, Kept {len(kept)} section markers')
    
    if removed:
        print(f'\n   📋 REMOVED COMMENTS:')
        for i, comment in enumerate(removed[:10], 1):
            preview = comment[:60] + '...' if len(comment) > 60 else comment
            print(f'      {i}. {preview}')
        if len(removed) > 10:
            print(f'      ... and {len(removed) - 10} more')
    
    if kept:
        print(f'\n   ✏️ KEPT SECTION MARKERS:')
        for i, comment in enumerate(kept[:10], 1):
            preview = comment[:60] + '...' if len(comment) > 60 else comment
            print(f'      {i}. {preview}')
        if len(kept) > 10:
            print(f'      ... and {len(kept) - 10} more')

# Summary
print('\n' + '='*70)
print('📊 SUMMARY:')
print('='*70)
total_removed = sum(len(v) for v in all_removed.values())
total_kept = sum(len(v) for v in all_kept.values())
print(f'✅ Total comments removed: {total_removed}')
print(f'✏️  Total section markers kept: {total_kept}')
print(f'\nAll files have been successfully cleaned and saved!')
