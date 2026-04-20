#!/usr/bin/env python
# -*- coding: utf-8 -*-
import re

def clean_html(file_path):
    """Remove annotation comments, keep block labels"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # List of annotation patterns to remove (but not block labels)
    remove_patterns = [
        r'<!--\s*(?:Slide \d|C\u1ed9t (?:tr\u00e1i|ph\u1ea3i)|H\u00e0ng|Kh\u1ed1i (?!ng\u00f4n)|Thay |L\u01b0u \u00fd|Chuy\u1ec3n |L\u01b0\u1edbi |Item tin|Icon |Text b\u00ean|Hi\u1ec7u \u1ee9ng|Danh s\u00e1ch|C\u00e1c \u1ea3nh|V\u00f9ng ch\u1ee9a)[^-]*?-->\s*\n',
    ]
    
    for pattern in remove_patterns:
        content = re.sub(pattern, '', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned HTML: {file_path}")

def clean_css(file_path):
    """Remove inline annotation comments from CSS"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    cleaned = []
    for line in lines:
        # Keep section headers with --- or =====
        if '---' in line or '=====' in line:
            cleaned.append(line)
        # Remove inline comments unless they're part of section headers
        elif '/*' in line and '*/' in line:
            # Keep block markers
            if '---' in line:
                cleaned.append(line)
            else:
                # Remove the inline comment, keep the code
                before_comment = line[:line.find('/*')]
                if before_comment.strip():
                    cleaned.append(before_comment.rstrip() + '\n')
        elif '//' in line:
            # Keep section headers like // ==================
            if '==' in line or '--' in line:
                cleaned.append(line)
            else:
                # Remove single-line comments unless they're markers
                before_comment = line[:line.find('//')]
                if before_comment.strip():
                    cleaned.append(before_comment.rstrip() + '\n')
        else:
            cleaned.append(line)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(cleaned)
    print(f"Cleaned CSS: {file_path}")

def clean_js(file_path):
    """Remove annotation comments from JavaScript"""  
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    cleaned = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Keep multi-line block headers (with === or ===)
        if '//' in line and '=' in line:
            cleaned.append(line)
        # Remove annotation comments
        elif line.strip().startswith('//') and not any(x in line for x in ['===', '---', 'TODO', 'FIXME']):
            # Check if it's an annotation comment (not a section marker)
            if not any(keyword in line for keyword in ['SECTION', 'BLOCK']):
                # Skip this line
                pass
            else:
                cleaned.append(line)
        else:
            cleaned.append(line)
        i += 1
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(cleaned)
    print(f"Cleaned JS: {file_path}")

# Run cleanups
clean_html('index.html')
clean_css('css/home.css')
clean_js('js/home.js')

print("All files cleaned successfully!")
