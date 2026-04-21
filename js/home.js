// Lắng nghe sự kiện cuộn trang
window.addEventListener('scroll', function() {
    var header = document.getElementById('main-header');
    
    if (window.scrollY > 150) {
        header.classList.add('is-sticky');
    } 
    else if (window.scrollY < 50) {
        header.classList.remove('is-sticky');
    }
});

// HIỆU ỨNG ĐẾM SỐ (COUNT UP) KHI CUỘN TRANG
const counters = document.querySelectorAll('.counter');
const counterSection = document.getElementById('counter-section');
let hasAnimated = false; 

// Hàm chạy đếm số
const runCounterAnimation = () => {
    counters.forEach(counter => {
        counter.innerText = '0'; // Đặt mặc định là 0
        
        const updateCounter = () => {
            const target = +counter.getAttribute('data-target'); // Lấy số đích từ HTML
            const c = +counter.innerText;
            
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

const observerOptions = {
    root: null,
    threshold: 0.5 
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
    resetSlideTimer(); 
}

function goToSlide(index) {
    currentSlideIndex = index;
    updateSliderPosition();
    resetSlideTimer();
}

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
// ==========================================
let currentTestiIndex = 0;
let testiTimer;
const testiTrack = document.getElementById('testiTrack');
const testiCards = document.querySelectorAll('.testi-card');
const dotsContainer = document.getElementById('testiDotsContainer');
const totalTestiCards = testiCards.length;

function getCardsPerView() {
    return window.innerWidth > 992 ? 2 : 1;
}

function getMaxSlides() {
    return totalTestiCards - getCardsPerView();
}

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

window.addEventListener('load', () => {
    createDots();
    updateTestiSlider();
    startTestiTimer();
});

window.addEventListener('resize', () => {
    currentTestiIndex = 0; // Đưa về slide đầu tiên cho an toàn
    createDots();
    updateTestiSlider();
});

// ==========================================
// KHỞI TẠO FANCYBOX (Thư viện xem ảnh)
// ==========================================
Fancybox.bind("[data-fancybox]", {
    Thumbs: {
        autoStart: true, 
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

function checkFacArrows() {
    if(!facPrevBtn || !facNextBtn) return;
    const maxIndex = facCards.length - getFacCardsPerView();

    if (facIndex === 0) {
        facPrevBtn.classList.add('slider-arrow-disabled');
    } else {
        facPrevBtn.classList.remove('slider-arrow-disabled');
    }

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
    
    checkFacArrows(); 
}

function moveFacSlide(direction) {
    const maxIndex = facCards.length - getFacCardsPerView();
    facIndex += direction;
    
    if (facIndex > maxIndex) facIndex = maxIndex;
    else if (facIndex < 0) facIndex = 0;

    updateFacSlider();
    resetFacTimer();
}

function startFacTimer() {
    facTimer = setInterval(() => { 
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

// ==========================================
// TOGGLE SEARCH BAR
// ==========================================
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchDropdown = document.getElementById('searchDropdown');

if (searchToggleBtn && searchDropdown) {
    searchToggleBtn.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        searchDropdown.classList.toggle('active');
        
        if (searchDropdown.classList.contains('active')) {
            const searchInput = searchDropdown.querySelector('input');
            setTimeout(() => { searchInput.focus(); }, 300); // Đợi hiệu ứng trượt xong mới focus
        }
    });
}

// ==========================================
// MODAL ĐĂNG KÝ TUYỂN SINH (FOOTER)
// ==========================================
const openContactBtn = document.getElementById('openContactModal');
const contactModal = document.getElementById('contactModal');
const closeContactBtn = document.getElementById('closeContactModal');

if(openContactBtn && contactModal && closeContactBtn) {
    // Mở modal
    openContactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        contactModal.classList.add('active');
    });

    // Đóng modal khi bấm dấu X
    closeContactBtn.addEventListener('click', () => {
        contactModal.classList.remove('active');
    });

    contactModal.addEventListener('click', (e) => {
        if(e.target === contactModal) {
            contactModal.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', function() {
    var header = document.getElementById('main-header');
    var backToTopBtn = document.getElementById('backToTopBtn'); // Gọi nút Scroll Top
    
    // --- Xử lý Header Sticky ---
    if (window.scrollY > 150) {
        header.classList.add('is-sticky');
    } else if (window.scrollY < 50) {
        header.classList.remove('is-sticky');
    }

    // --- Xử lý hiện nút Back To Top ---
    if (backToTopBtn) {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show-btn');
        } else {
            backToTopBtn.classList.remove('show-btn');
        }
    }
});

// ==========================================
// MOBILE MENU 
// ==========================================
const hamburgerMenu = document.getElementById('hamburgerMenu');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

if(hamburgerMenu && mobileMenu) {
    // Mở Menu
    hamburgerMenu.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Khóa cuộn trang nền
    });

    // Đóng Menu bằng nút X
    closeMobileMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Mở lại cuộn trang
    });

    // Đóng Menu khi click vào vùng tối
    mobileMenuOverlay.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = ''; 
    });

    // --- XỬ LÝ CLICK ĐỂ MỞ/ĐÓNG MENU CON ---
    const mobileDropdownToggles = document.querySelectorAll('.mobile-nav-item-flex i');

    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            const parentLi = this.closest('.mobile-has-dropdown');
            
            parentLi.classList.toggle('open');
            
            // Chỉ cho phép mở 1 menu con tại 1 thời điểm (Accordion)
            const allParentLis = document.querySelectorAll('.mobile-has-dropdown');
            allParentLis.forEach(li => {
                if(li !== parentLi) {
                    li.classList.remove('open');
                }
            });
        });
    });

    // ==========================================
    // PROGRAMS SLIDER LOGIC (Cho Mobile/Tablet)
    // ==========================================
    let progIndex = 0;
    const progTrack = document.getElementById('programTrack');
    const progCards = document.querySelectorAll('.program-card');
    const progPrevBtn = document.querySelector('.prog-arrow.prev');
    const progNextBtn = document.querySelector('.prog-arrow.next');

    // Tính toán số thẻ hiển thị
    function getProgCardsPerView() {
        if (window.innerWidth > 992) return 4;
        if (window.innerWidth > 768) return 2;
        return 1;
    }

    // Kiểm tra để làm mờ nút (dùng chung class .slider-arrow-disabled đã có)
    function checkProgArrows() {
        if(!progPrevBtn || !progNextBtn) return;
        const maxIndex = progCards.length - getProgCardsPerView();

        if (progIndex === 0) {
            progPrevBtn.classList.add('slider-arrow-disabled');
        } else {
            progPrevBtn.classList.remove('slider-arrow-disabled');
        }

        if (progIndex >= maxIndex || maxIndex <= 0) {
            progNextBtn.classList.add('slider-arrow-disabled');
        } else {
            progNextBtn.classList.remove('slider-arrow-disabled');
        }
    }

    // Di chuyển Track
    function updateProgSlider() {
        if(!progTrack || progCards.length === 0) return;
        const cardWidth = progCards[0].offsetWidth;
        const gap = 20; 
        const moveAmount = (cardWidth + gap) * progIndex;
        progTrack.style.transform = `translateX(-${moveAmount}px)`;
        
        checkProgArrows();
    }

    // Xử lý Click mũi tên
    function moveProgramSlide(direction) {
        const maxIndex = progCards.length - getProgCardsPerView();
        progIndex += direction;

        if (progIndex > maxIndex) progIndex = maxIndex;
        else if (progIndex < 0) progIndex = 0;

        updateProgSlider();
    }

    // Khởi chạy
    window.addEventListener('load', () => {
        if(progCards.length > 0) {
            updateProgSlider();
        }
    });

    // Cập nhật khi xoay màn hình điện thoại
    window.addEventListener('resize', () => {
        progIndex = 0;
        updateProgSlider();
    });
}
