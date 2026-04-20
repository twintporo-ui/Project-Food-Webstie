document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector(".header");

    function checkScroll() {
        if (window.scrollY > 100) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
    checkScroll();
    window.addEventListener("scroll", checkScroll);

    const mobileToggle = document.querySelector(".mobile-toggle");
    mobileToggle.addEventListener("click", function () {
        this.classList.toggle("active");
    });

    const menuTabs = document.querySelectorAll(".menu-tab");
    const menuItems = document.querySelectorAll(".menu-item");

    function filterMenu(selected) {
        menuItems.forEach((item) => {
            const category = item.querySelector(".menu-item-category");
            const categoryText = category ? category.textContent.trim() : "";
            item.style.display = (selected === "All" || categoryText === selected) ? "" : "none";
        });
    }

    menuTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            menuTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            filterMenu(tab.textContent.trim());
        });
    });

    filterMenu("All");

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            if (this.getAttribute("href") === "#") return;
            const targetElement = document.querySelector(this.getAttribute("href"));
            if (targetElement) {
                window.scrollTo({ top: targetElement.offsetTop - 80, behavior: "smooth" });
            }
        });
    });

    // ==================== Cart with item tracking ====================
    const cartCount = document.querySelector(".cart-count");
    const cartItems = {};
    const itemPrices = {};

    // Build price map from DOM
    document.querySelectorAll(".menu-item").forEach((card) => {
        const nameEl = card.querySelector(".menu-item-name");
        const priceEl = card.querySelector(".menu-item-price");
        if (nameEl && priceEl) {
            const name = nameEl.textContent.trim();
            const priceMatch = priceEl.textContent.replace(/[^\d]/g, "");
            itemPrices[name] = parseInt(priceMatch) || 0;
        }
    });

    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".menu-item-btn");
        if (!btn) return;

        const card = btn.closest(".menu-item");
        const nameEl = card ? card.querySelector(".menu-item-name") : null;
        const itemName = nameEl ? nameEl.textContent.trim() : "Unknown Item";

        cartItems[itemName] = (cartItems[itemName] || 0) + 1;

        const total = Object.values(cartItems).reduce((a, b) => a + b, 0);
        cartCount.textContent = total;

        // Animate button
        btn.style.transform = "scale(1.3)";
        btn.style.background = "#d4a96a";
        setTimeout(() => {
            btn.style.transform = "";
            btn.style.background = "";
        }, 300);
    });

    // ==================== 3-Step Order Modal ====================
    const orderModal = document.getElementById("orderModal");
    const closeModal = document.getElementById("closeModal");

    const openButtons = [
        document.getElementById("openOrderModal"),
        document.getElementById("openOrderModalNav"),
        document.getElementById("openOrderModalHero"),
        document.getElementById("openOrderModalBottom"),
    ];

    // Expose goStep globally for inline onclick
    window.goStep = function(step) {
        if (step === 2) {
            const name = document.getElementById("orderName").value.trim();
            const phone = document.getElementById("orderPhone").value.trim();
            const address = document.getElementById("orderAddress").value.trim();
            if (!name || !phone || !address) {
                alert("กรุณากรอกชื่อ เบอร์โทรศัพท์ และที่อยู่จัดส่งให้ครบครับ");
                return;
            }
            renderCartSummary();
        }
        if (step === 3) {
            submitOrderFn();
            return;
        }
        showStep(step);
    };

    function showStep(n) {
        [1, 2, 3].forEach(i => {
            document.getElementById("modalStep" + i).style.display = i === n ? "" : "none";
        });
        // Update step indicators
        const colors = { active: "#9d2e33", done: "#2e7d32", inactive: "#ddd" };
        const textColors = { active: "#9d2e33", done: "#2e7d32", inactive: "#aaa" };
        [1, 2, 3].forEach(i => {
            const dot = document.getElementById("step" + i + "Dot") || document.querySelector(`#step${i}Ind span`);
            const ind = document.getElementById("step" + i + "Ind");
            let state = i < n ? "done" : i === n ? "active" : "inactive";
            if (dot) {
                dot.style.background = colors[state];
                dot.style.color = state === "inactive" ? "#888" : "#fff";
                dot.textContent = state === "done" ? "✓" : i;
            }
            if (ind) ind.style.color = textColors[state];
        });
        // Scroll modal to top
        const box = document.getElementById("orderModalBox");
        if (box) box.scrollTop = 0;
    }

    function renderCartSummary() {
        const box = document.getElementById("cartSummaryBox");
        const totalEl = document.getElementById("orderTotalAmt");
        if (!box) return;

        const entries = Object.entries(cartItems).filter(([, qty]) => qty > 0);
        if (entries.length === 0) {
            box.innerHTML = `<p style="color:#aaa; font-size:0.9rem; text-align:center; padding:0.5rem 0;">ยังไม่มีรายการในตะกร้า<br><span style="font-size:0.8rem;">กลับไปเลือกเมนูก่อนนะครับ</span></p>`;
            if (totalEl) totalEl.textContent = "฿0";
            return;
        }

        let total = 0;
        box.innerHTML = entries.map(([name, qty]) => {
            const price = itemPrices[name] || 0;
            const subtotal = price * qty;
            total += subtotal;
            return `<div style="display:flex; justify-content:space-between; align-items:center; padding:0.55rem 0; border-bottom:1px solid #e9e5e0;">
                <div style="display:flex; align-items:center; gap:0.6rem;">
                    <span style="background:#9d2e33; color:#fff; border-radius:50%; width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;">${qty}</span>
                    <span style="font-size:0.9rem; color:#1d1d1d;">${name}</span>
                </div>
                <span style="font-family:'Playfair Display',serif; font-weight:600; color:#9d2e33; font-size:0.95rem;">฿${subtotal}</span>
            </div>`;
        }).join("") + `<div style="display:flex; justify-content:space-between; padding-top:0.6rem; font-weight:600; font-size:0.9rem; color:#5a5a5a;">
            <span>รวม ${Object.values(cartItems).reduce((a,b)=>a+b,0)} รายการ</span>
        </div>`;

        if (totalEl) totalEl.textContent = "฿" + total.toLocaleString();
    }

    function submitOrderFn() {
        const name = document.getElementById("orderName").value.trim();
        const phone = document.getElementById("orderPhone").value.trim();
        const address = document.getElementById("orderAddress").value.trim();
        if (!name || !phone || !address) {
            alert("กรุณากรอกข้อมูลให้ครบทุกช่องครับ");
            return;
        }
        showStep(3);
        setTimeout(() => {
            closeModalFn();
            // Reset
            document.getElementById("orderName").value = "";
            document.getElementById("orderPhone").value = "";
            document.getElementById("orderAddress").value = "";
            document.getElementById("orderItems").value = "";
            Object.keys(cartItems).forEach(k => delete cartItems[k]);
            cartCount.textContent = "0";
            showStep(1);
        }, 3500);
    }

    function openModal() {
        showStep(1);
        orderModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeModalFn() {
        orderModal.style.display = "none";
        document.body.style.overflow = "";
    }

    openButtons.forEach((btn) => {
        if (btn) btn.addEventListener("click", openModal);
    });

    if (closeModal) closeModal.addEventListener("click", closeModalFn);

    orderModal.addEventListener("click", (e) => {
        if (e.target === orderModal) closeModalFn();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && orderModal.style.display === "flex") closeModalFn();
    });

    // Style payment radio labels on change
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
        radio.addEventListener("change", () => {
            document.querySelectorAll('input[name="payMethod"]').forEach(r => {
                const label = r.closest("label");
                if (label) {
                    label.style.borderColor = r.checked ? "#9d2e33" : "#e9e5e0";
                    label.style.background = r.checked ? "#fff8f8" : "#fff";
                }
            });
        });
    });

    // ==================== Review Form Star Rating ====================
    let selectedRating = 0;
    const stars = document.querySelectorAll(".rstar");

    stars.forEach((star) => {
        star.addEventListener("mouseover", () => {
            const val = parseInt(star.dataset.value);
            stars.forEach((s) => s.classList.toggle("hovered", parseInt(s.dataset.value) <= val));
        });
        star.addEventListener("mouseout", () => {
            stars.forEach((s) => s.classList.remove("hovered"));
        });
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach((s) => s.classList.toggle("selected", parseInt(s.dataset.value) <= selectedRating));
        });
    });

    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const successMsg = document.getElementById("reviewSuccess");
            if (successMsg) {
                successMsg.style.display = "flex";
                setTimeout(() => {
                    successMsg.style.display = "none";
                    reviewForm.reset();
                    selectedRating = 0;
                    stars.forEach((s) => s.classList.remove("selected", "hovered"));
                }, 3000);
            }
        });
    }
});
