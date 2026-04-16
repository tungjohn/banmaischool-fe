// Lắng nghe sự kiện cuộn trang
window.addEventListener('scroll', function() {
    var header = document.getElementById('main-header');
    
    // KHI CUỘN XUỐNG: Phải cuộn qua mốc 150px mới bắt đầu thu nhỏ
    if (window.scrollY > 150) {
        header.classList.add('is-sticky');
    } 
    // KHI CUỘN LÊN: Phải cuộn lên gần sát trên cùng (nhỏ hơn 50px) mới phóng to lại
    else if (window.scrollY < 50) {
        header.classList.remove('is-sticky');
    }
});

// ==========================================
// HIỆU ỨNG ĐẾM SỐ (COUNT UP) KHI CUỘN TRANG
// ==========================================
const counters = document.querySelectorAll('.counter');
const counterSection = document.getElementById('counter-section');
let hasAnimated = false; // Biến kiểm tra để chỉ chạy hiệu ứng 1 lần

// Hàm chạy đếm số
const runCounterAnimation = () => {
    counters.forEach(counter => {
        counter.innerText = '0'; // Đặt mặc định là 0
        
        const updateCounter = () => {
            const target = +counter.getAttribute('data-target'); // Lấy số đích từ HTML
            const c = +counter.innerText;
            
            // Tốc độ chạy (số càng lớn chạy càng chậm, có thể chỉnh sửa)
            const increment = target / 50; 

            if (c < target) {
                counter.innerText = `${Math.ceil(c + increment)}`;
                setTimeout(updateCounter, 30); // Cứ 30ms cập nhật 1 lần
            } else {
                counter.innerText = target; // Đảm bảo số dừng đúng target
            }
        };
        updateCounter();
    });
};

// Sử dụng Intersection Observer để phát hiện khi người dùng cuộn tới vùng chứa số
const observerOptions = {
    root: null,
    threshold: 0.5 // Kích hoạt khi 50% vùng chứa số xuất hiện trên màn hình
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
            runCounterAnimation();
            hasAnimated = true; // Đánh dấu là đã chạy
            observer.unobserve(entry.target); // Ngừng theo dõi để tối ưu hiệu suất
        }
    });
}, observerOptions);

// Bắt đầu theo dõi section chứa các con số
if (counterSection) {
    observer.observe(counterSection);
}

// ==========================================
// HERO SLIDER LOGIC
// ==========================================
let currentSlideIndex = 0;
let slideTimer;
const sliderContainer = document.getElementById('heroSlider');
const dots = document.querySelectorAll('.slider-dots .dot');
const totalSlides = document.querySelectorAll('.slide').length;

function updateSliderPosition() {
    if (!sliderContainer) return;
    // Dịch chuyển container sang trái dựa trên index hiện tại
    sliderContainer.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    // Cập nhật trạng thái active cho dấu chấm
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots.length > 0) {
        dots[currentSlideIndex].classList.add('active');
    }
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    
    // Quay vòng slider nếu vượt quá giới hạn
    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - 1;
    }
    
    updateSliderPosition();
    resetSlideTimer(); // Reset hẹn giờ tự động chạy khi người dùng tự click
}

function goToSlide(index) {
    currentSlideIndex = index;
    updateSliderPosition();
    resetSlideTimer();
}

// Tự động chuyển slide sau mỗi 5 giây (5000ms)
function startSlideTimer() {
    slideTimer = setInterval(() => {
        changeSlide(1);
    }, 5000); 
}

function resetSlideTimer() {
    clearInterval(slideTimer);
    startSlideTimer();
}

// Khởi động slider khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    if (sliderContainer && totalSlides > 0) {
        startSlideTimer();
    }
});

// ==========================================
// TESTIMONIALS SLIDER LOGIC (Trượt từng thẻ một)
// ==========================================
let currentTestiIndex = 0;
let testiTimer;
const testiTrack = document.getElementById('testiTrack');
const testiCards = document.querySelectorAll('.testi-card');
const dotsContainer = document.getElementById('testiDotsContainer');
const totalTestiCards = testiCards.length;

// Xác định số thẻ hiển thị trên màn hình (Desktop: 2, Mobile: 1)
function getCardsPerView() {
    return window.innerWidth > 992 ? 2 : 1;
}

// Tính toán số lần trượt tối đa có thể (để không bị trượt vào khoảng trắng)
function getMaxSlides() {
    return totalTestiCards - getCardsPerView();
}

// Tạo dấu chấm (dots) động dựa trên số lần trượt
function createDots() {
    if(!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const max = getMaxSlides();
    for (let i = 0; i <= max; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToTestiSlide(i));
        dotsContainer.appendChild(dot);
    }
}

// Cập nhật vị trí Track và màu của Dot
function updateTestiSlider() {
    if(!testiTrack || totalTestiCards === 0) return;
    
    // Tính toán khoảng cách trượt = (Chiều rộng 1 thẻ + Khoảng cách gap 30px) * index
    const cardWidth = testiCards[0].offsetWidth;
    const gap = 30; 
    const moveAmount = (cardWidth + gap) * currentTestiIndex;
    
    testiTrack.style.transform = `translateX(-${moveAmount}px)`;

    // Cập nhật class Active cho dấu chấm
    const allDots = dotsContainer.querySelectorAll('.dot');
    allDots.forEach(dot => dot.classList.remove('active'));
    if(allDots[currentTestiIndex]) {
        allDots[currentTestiIndex].classList.add('active');
    }
}

// Hàm chuyển slide
function changeTestiSlide() {
    const maxSlides = getMaxSlides();
    currentTestiIndex++;
    
    // Nếu chạy hết thẻ thì quay lại từ đầu
    if (currentTestiIndex > maxSlides) {
        currentTestiIndex = 0;
    }
    updateTestiSlider();
}

// Nhảy đến slide khi click vào chấm
function goToTestiSlide(index) {
    currentTestiIndex = index;
    updateTestiSlider();
    resetTestiTimer(); // Reset bộ đếm khi người dùng tự click
}

// Auto play mỗi 5 giây
function startTestiTimer() {
    testiTimer = setInterval(changeTestiSlide, 5000);
}

function resetTestiTimer() {
    clearInterval(testiTimer);
    startTestiTimer();
}

// Khởi tạo slider khi load trang và khi resize màn hình
window.addEventListener('load', () => {
    createDots();
    updateTestiSlider();
    startTestiTimer();
});

// Cập nhật lại dots và vị trí nếu người dùng thu phóng cửa sổ trình duyệt
window.addEventListener('resize', () => {
    currentTestiIndex = 0; // Đưa về slide đầu tiên cho an toàn
    createDots();
    updateTestiSlider();
});

// ==========================================
// KHỞI TẠO FANCYBOX (Thư viện xem ảnh)
// ==========================================
Fancybox.bind("[data-fancybox]", {
    // Tùy chỉnh (có thể xem thêm trên trang chủ Fancybox)
    Thumbs: {
        autoStart: true, // Tự động hiện danh sách ảnh thu nhỏ bên dưới
    },
});

// ==========================================
// FACILITIES SLIDER LOGIC
// ==========================================
let facIndex = 0;
let facTimer;
const facTrack = document.getElementById('facTrack');
const facCards = document.querySelectorAll('.fac-card');
// Lấy các nút điều hướng của Facilities
const facPrevBtn = document.querySelector('.fac-slider-wrapper .prev');
const facNextBtn = document.querySelector('.fac-slider-wrapper .next');

function getFacCardsPerView() {
    return window.innerWidth > 992 ? 2 : 1;
}

// HÀM MỚI: Kiểm tra và ẩn/hiện nút
function checkFacArrows() {
    if(!facPrevBtn || !facNextBtn) return;
    const maxIndex = facCards.length - getFacCardsPerView();

    // Nếu đang ở thẻ đầu tiên (index = 0) -> Ẩn nút Trái
    if (facIndex === 0) {
        facPrevBtn.classList.add('slider-arrow-disabled');
    } else {
        facPrevBtn.classList.remove('slider-arrow-disabled');
    }

    // Nếu đang ở thẻ cuối cùng (index = maxIndex) -> Ẩn nút Phải
    if (facIndex >= maxIndex) {
        facNextBtn.classList.add('slider-arrow-disabled');
    } else {
        facNextBtn.classList.remove('slider-arrow-disabled');
    }
}

function updateFacSlider() {
    if(!facTrack || facCards.length === 0) return;
    const cardWidth = facCards[0].offsetWidth;
    const gap = 30;
    const moveAmount = (cardWidth + gap) * facIndex;
    facTrack.style.transform = `translateX(-${moveAmount}px)`;
    
    // Gọi hàm check nút mỗi khi slider di chuyển
    checkFacArrows(); 
}

function moveFacSlide(direction) {
    const maxIndex = facCards.length - getFacCardsPerView();
    facIndex += direction;
    
    // Khi nhấn tới/lui, nếu vượt quá giới hạn thì ép nó đứng lại ở mốc cuối
    if (facIndex > maxIndex) facIndex = maxIndex;
    else if (facIndex < 0) facIndex = 0;

    updateFacSlider();
    resetFacTimer();
}

function startFacTimer() {
    facTimer = setInterval(() => { 
        // Xử lý auto-play: Khi đến cuối thì quay lại đầu
        const maxIndex = facCards.length - getFacCardsPerView();
        if(facIndex >= maxIndex) {
            facIndex = 0;
            updateFacSlider();
        } else {
            moveFacSlide(1); 
        }
    }, 5000);
}

function resetFacTimer() {
    clearInterval(facTimer);
    startFacTimer();
}

window.addEventListener('load', () => {
    if(facCards.length > 0) {
        updateFacSlider();
        startFacTimer();
    }
});

window.addEventListener('resize', () => {
    facIndex = 0;
    updateFacSlider();
});

// ==========================================
// PARTNERS SLIDER LOGIC
// ==========================================
let partnerIndex = 0;
let partnerTimer;
const partnerTrack = document.getElementById('partnerTrack');
const partnerSlides = document.querySelectorAll('.partner-slide');
// Lấy các nút điều hướng của Partners
const partnerPrevBtn = document.querySelector('.partner-slider-wrapper .prev');
const partnerNextBtn = document.querySelector('.partner-slider-wrapper .next');

function getPartnerCardsPerView() {
    if (window.innerWidth > 992) return 4;
    if (window.innerWidth > 576) return 2;
    return 1;
}

// HÀM MỚI: Kiểm tra và ẩn/hiện nút
function checkPartnerArrows() {
    if(!partnerPrevBtn || !partnerNextBtn) return;
    const maxIndex = partnerSlides.length - getPartnerCardsPerView();

    if (partnerIndex === 0) {
        partnerPrevBtn.classList.add('slider-arrow-disabled');
    } else {
        partnerPrevBtn.classList.remove('slider-arrow-disabled');
    }

    if (partnerIndex >= maxIndex) {
        partnerNextBtn.classList.add('slider-arrow-disabled');
    } else {
        partnerNextBtn.classList.remove('slider-arrow-disabled');
    }
}

function updatePartnerSlider() {
    if(!partnerTrack || partnerSlides.length === 0) return;
    const cardWidth = partnerSlides[0].offsetWidth;
    const gap = 20; 
    const moveAmount = (cardWidth + gap) * partnerIndex;
    partnerTrack.style.transform = `translateX(-${moveAmount}px)`;
    
    // Gọi hàm check nút
    checkPartnerArrows();
}

function movePartnerSlide(direction) {
    const maxIndex = partnerSlides.length - getPartnerCardsPerView();
    partnerIndex += direction;
    
    if (partnerIndex > maxIndex) partnerIndex = maxIndex; 
    else if (partnerIndex < 0) partnerIndex = 0; 

    updatePartnerSlider();
    resetPartnerTimer();
}

function startPartnerTimer() {
    partnerTimer = setInterval(() => { 
        // Auto-play: Khi đến cuối thì quay lại đầu
        const maxIndex = partnerSlides.length - getPartnerCardsPerView();
        if(partnerIndex >= maxIndex) {
            partnerIndex = 0;
            updatePartnerSlider();
        } else {
            movePartnerSlide(1); 
        }
    }, 5000);
}

function resetPartnerTimer() {
    clearInterval(partnerTimer);
    startPartnerTimer();
}

window.addEventListener('load', () => {
    if(partnerSlides.length > 0) {
        updatePartnerSlider();
        startPartnerTimer();
    }
});

window.addEventListener('resize', () => {
    partnerIndex = 0;
    updatePartnerSlider();
});