"use strict";

/* ================= STORAGE ================= */

function readData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (e) {
        return fallback;
    }
}

function writeData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        alert("Storage full. Please clear old browser data.");
        return false;
    }
}


/* ================= DATA ================= */

let account = readData("tnAccount", null);
let products = readData("tnProducts", []);
let requests = readData("tnRequests", []);
let trades = readData("tnTrades", []);

let currentPhoto = "";
let currentUPIQR = "";
let cameraStream = null;


/* ================= AUTH ================= */

function showCreate() {
    document.getElementById("createPage").classList.remove("hidden");
    document.getElementById("loginPage").classList.add("hidden");
}

function showLogin() {
    document.getElementById("createPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
}

function togglePassword(id, btn) {

    const input = document.getElementById(id);

    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
    } else {
        input.type = "password";
        btn.textContent = "👁";
    }
}


function createAccount() {

    const name =
        document.getElementById("createName").value.trim();

    const phone =
        document.getElementById("createPhone").value.trim();

    const username =
        document.getElementById("createUsername").value.trim();

    const password =
        document.getElementById("createPassword").value;

    const role =
        document.getElementById("createRole").value;


    if (!name || !phone || !username || !password || !role) {

        showMessage(
            "createMsg",
            "❌ Please fill all details.",
            "red"
        );

        return;
    }


    account = {

        name,
        phone,
        username,
        password,
        role,

        thought: "",

        upi: "",
        upiQR: "",
        bankAccount: "",
        ifsc: "",

        ratingTotal: 0,
        ratingCount: 0,
        feedbacks: []

    };


    writeData("tnAccount", account);

    localStorage.removeItem("tnLoggedIn");

    showMessage(
        "createMsg",
        "✅ Account created successfully!",
        "green"
    );


    setTimeout(() => {

        showLogin();

        document.getElementById(
            "loginUsername"
        ).value = username;

    }, 600);
}


function login() {

    account =
        readData("tnAccount", null);


    if (!account) {

        showCreate();

        return;
    }


    const username =
        document.getElementById(
            "loginUsername"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    if (
        username === account.username &&
        password === account.password
    ) {

        localStorage.setItem(
            "tnLoggedIn",
            "true"
        );

        openApp();

    } else {

        showMessage(
            "loginMsg",
            "❌ Invalid username or password.",
            "red"
        );
    }
}


function logout() {

    localStorage.removeItem(
        "tnLoggedIn"
    );

    stopCamera();

    document.getElementById(
        "appPage"
    ).classList.add("hidden");

    document.getElementById(
        "loginPage"
    ).classList.remove("hidden");

    document.getElementById(
        "loginPassword"
    ).value = "";
}


/* ================= APP ================= */

function openApp() {

    document.getElementById(
        "createPage"
    ).classList.add("hidden");

    document.getElementById(
        "loginPage"
    ).classList.add("hidden");

    document.getElementById(
        "appPage"
    ).classList.remove("hidden");


    document.getElementById(
        "welcomeUser"
    ).textContent =
        "👋 " + account.name;


    document.getElementById(
        "accountName"
    ).textContent =
        account.name;


    document.getElementById(
        "accountPhone"
    ).textContent =
        account.phone;


    document.getElementById(
        "accountRole"
    ).textContent =
        account.role === "farmer"
            ? "👨‍🌾 Farmer"
            : "🛒 Buyer";


    document.getElementById(
        "addNav"
    ).style.display =
        account.role === "farmer"
            ? "block"
            : "none";


    document.getElementById(
        "chartSection"
    ).style.display =
        account.role === "farmer"
            ? "block"
            : "none";


    updateProfileUI();

    displayProducts();

    displayRequests();

    displayTrades();

    updateBuyerOfferChart();

    updateNotificationCount();

    cleanupZeroStock();
}


/* ================= NAV ================= */

function showSection(id) {

    document
        .querySelectorAll(".section")
        .forEach(s => {
            s.classList.remove("active");
        });


    const target =
        document.getElementById(id);


    if (target) {
        target.classList.add("active");
    }


    if (id === "products") {
        displayProducts();
    }


    if (id === "requests") {

        displayRequests();

        updateBuyerOfferChart();

    }


    if (id === "trading") {
        displayTrades();
    }


    if (id === "account") {
        updateProfileUI();
    }
}


/* ================= CAMERA ================= */

async function startCamera() {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(
            "Camera is not supported."
        );

        return;
    }


    try {

        stopCamera();

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                },
                audio: false
            });


        const video =
            document.getElementById("camera");


        video.srcObject =
            cameraStream;


        await video.play();

    } catch (e) {

        alert(
            "Camera permission denied or camera unavailable."
        );
    }
}


function takePhoto() {

    if (!cameraStream) {

        alert(
            "First click Open Camera."
        );

        return;
    }


    const video =
        document.getElementById("camera");


    const canvas =
        document.getElementById("canvas");


    if (!video.videoWidth) {

        alert(
            "Camera is still starting."
        );

        return;
    }


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    canvas
        .getContext("2d")
        .drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );


    currentPhoto =
        canvas.toDataURL(
            "image/jpeg",
            .65
        );


    showPhotoPreview(
        currentPhoto
    );
}


function uploadPhoto(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = e => {

        currentPhoto =
            e.target.result;

        showPhotoPreview(
            currentPhoto
        );

    };


    reader.readAsDataURL(file);
}


function showPhotoPreview(image) {

    const preview =
        document.getElementById(
            "photoPreview"
        );


    preview.src = image;

    preview.classList.remove(
        "hidden"
    );
}


function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track =>
                track.stop()
            );

        cameraStream = null;
    }


    const video =
        document.getElementById(
            "camera"
        );


    if (video) {
        video.srcObject = null;
    }
}


/* ================= ADD CROP ================= */

function addProduct() {

    if (
        !account ||
        account.role !== "farmer"
    ) {

        alert(
            "Only farmers can add crops."
        );

        return;
    }


    const cropName =
        document.getElementById(
            "cropName"
        ).value.trim();


    const quantity =
        Number(
            document.getElementById(
                "cropQuantity"
            ).value
        );


    const price =
        Number(
            document.getElementById(
                "cropPrice"
            ).value
        );


    const contact =
        document.getElementById(
            "farmerContact"
        ).value.trim();


    if (
        !cropName ||
        quantity <= 0 ||
        price <= 0 ||
        !contact
    ) {

        alert(
            "Please enter crop, quantity, price and contact."
        );

        return;
    }


    products.push({

        id: Date.now(),

        farmerName:
            account.name,

        farmerPhone:
            account.phone,

        cropName,

        quantity,

        remainingQuantity:
            quantity,

        price,

        contact,

        photo:
            currentPhoto,

        createdAt:
            new Date().toLocaleString()

    });


    writeData(
        "tnProducts",
        products
    );


    clearProductForm();


    showMessage(
        "productMsg",
        "✅ Crop added successfully!",
        "green"
    );


    displayProducts();
}


function clearProductForm() {

    [
        "cropName",
        "cropQuantity",
        "cropPrice",
        "farmerContact"
    ].forEach(id => {

        document.getElementById(
            id
        ).value = "";

    });


    currentPhoto = "";


    document
        .getElementById(
            "photoPreview"
        )
        .classList.add(
            "hidden"
        );


    stopCamera();
}


/* ================= PRODUCTS ================= */

function displayProducts() {

    cleanupZeroStock();


    const container =
        document.getElementById(
            "productList"
        );


    if (!container) return;


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML = `
            <div class="feature-card">
                🌱 No crops available yet.
            </div>
        `;

        return;
    }


    products.forEach(product => {

        const own =
            account &&
            product.farmerName ===
            account.name;


        const image =
            product.photo

                ?

                `
                <img
                    class="product-image"
                    src="${product.photo}"
                    alt="Crop"
                >
                `

                :

                `
                <div
                    class="product-image"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:60px;
                    "
                >
                    👨‍🌾🌾
                </div>
                `;


        container.innerHTML += `

            <div class="product-card">

                ${image}

                <div class="product-content">

                    <h3>
                        🌾
                        ${escapeHTML(
            product.cropName
        )}
                    </h3>

                    <p>
                        👨‍🌾 Farmer:
                        <strong>
                            ${escapeHTML(
            product.farmerName
        )}
                        </strong>
                    </p>

                    <p>
                        📦 Available Stock:
                        <strong class="stock-good">
                            ${product.remainingQuantity} KG
                        </strong>
                    </p>

                    <p>
                        💰 Farmer Price:
                        <strong>
                            ₹${product.price}/KG
                        </strong>
                    </p>

                    <p>
                        📞
                        ${escapeHTML(
            product.contact
        )}
                    </p>

                    <div class="product-buttons">

                        ${account.role === "buyer" &&
                !own
                ?

                `
                            <button
                                class="request-btn"
                                onclick="requestProduct(${product.id})"
                            >
                                🛒 Request Quantity
                            </button>
                            `

                :

                ""
            }


                        ${account.role === "farmer" &&
                own

                ?

                `
                            <button
                                class="edit-btn"
                                onclick="editProduct(${product.id})"
                            >
                                ✏️ Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteProduct(${product.id})"
                            >
                                🗑️ Delete
                            </button>
                            `

                :

                ""
            }

                    </div>

                </div>

            </div>

        `;
    });
}


/* ================= BUYER REQUEST ================= */

function requestProduct(productId) {

    if (
        !account ||
        account.role !== "buyer"
    ) {

        alert(
            "🛒 Buyer account-ல் login செய்யவும்."
        );

        return;
    }


    const product =
        products.find(
            p =>
                Number(p.id) ===
                Number(productId)
        );


    if (!product) {

        alert(
            "❌ Crop not found."
        );

        return;
    }


    if (
        Number(product.remainingQuantity) <= 0
    ) {

        alert(
            "❌ This crop is currently out of stock."
        );

        return;
    }


    const quantityInput =
        prompt(
            "📦 Enter Required Quantity (KG)\n\n" +
            "Available: " +
            product.remainingQuantity +
            " KG"
        );


    if (quantityInput === null) return;


    const quantity =
        Number(quantityInput);


    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        alert(
            "❌ Please enter a valid quantity."
        );

        return;
    }


    if (
        quantity >
        Number(
            product.remainingQuantity
        )
    ) {

        alert(
            "❌ Requested quantity is greater than available quantity."
        );

        return;
    }


    const priceInput =
        prompt(
            "💰 Enter Your Offer Price / KG\n\n" +
            "Farmer Price: ₹" +
            product.price +
            "/KG"
        );


    if (priceInput === null) return;


    const offerPrice =
        Number(priceInput);


    if (
        !Number.isFinite(offerPrice) ||
        offerPrice <= 0
    ) {

        alert(
            "❌ Please enter a valid price."
        );

        return;
    }


    const total =
        quantity * offerPrice;


    const newRequest = {

        id: Date.now(),

        productId:
            product.id,

        cropName:
            product.cropName,

        farmerName:
            product.farmerName,

        farmerPhone:
            product.farmerPhone ||
            product.contact,

        buyerName:
            account.name,

        buyerPhone:
            account.phone,

        quantity,

        offerPrice,

        total,

        status:
            "Pending",

        createdAt:
            new Date().toLocaleString()

    };


    requests.push(
        newRequest
    );


    saveAll();


    notifyOtherUser(
        product.farmerName,
        "💰 New Buyer Request",
        account.name +
        " requested " +
        quantity +
        " KG of " +
        product.cropName
    );


    alert(
        "✅ PRICE REQUEST SENT!\n\n" +
        "🌾 Crop: " +
        product.cropName +
        "\n📦 Quantity: " +
        quantity +
        " KG" +
        "\n💰 Offer: ₹" +
        offerPrice +
        "/KG" +
        "\n💵 Total: ₹" +
        total +
        "\n\n⏳ Waiting for Farmer approval."
    );


    displayRequests();

    updateBuyerOfferChart();

    updateNotificationCount();
}


/* ================= REQUEST DISPLAY ================= */

function displayRequests() {

    const container =
        document.getElementById(
            "requestList"
        );


    if (!container || !account)
        return;


    container.innerHTML = "";


    const visible =
        account.role === "farmer"

            ?

            requests.filter(
                r =>
                    r.farmerName ===
                    account.name
            )

            :

            requests.filter(
                r =>
                    r.buyerName ===
                    account.name
            );


    if (visible.length === 0) {

        container.innerHTML = `

            <div class="feature-card">

                📭

                ${account.role === "farmer"

                ?

                "No buyer price requests yet."

                :

                "You have not sent any price requests yet."
            }

            </div>

        `;

        return;
    }


    visible
        .slice()
        .sort(
            (a, b) =>
                Number(b.id) -
                Number(a.id)
        )
        .forEach(request => {

            let buttons = "";


            if (
                account.role === "farmer" &&
                request.status === "Pending"
            ) {

                buttons = `

                    <div class="product-buttons">

                        <button
                            class="accept-btn"
                            onclick="acceptRequest(${request.id})"
                        >
                            ✅ Accept
                        </button>

                        <button
                            class="reject-btn"
                            onclick="rejectRequest(${request.id})"
                        >
                            ❌ Reject
                        </button>

                    </div>
                `;
            }


            const statusClass =
                request.status === "Accepted"
                    ? "accepted"
                    : request.status === "Rejected"
                        ? "rejected"
                        : "pending";


            const statusText =
                request.status === "Accepted"
                    ? "✅ ACCEPTED"
                    : request.status === "Rejected"
                        ? "❌ REJECTED"
                        : "⏳ PENDING";


            container.innerHTML += `

                <div class="request-card">

                    <h3>
                        🌾
                        ${escapeHTML(
                request.cropName
            )}
                    </h3>

                    <div class="request-details">

                        <div class="detail">
                            <strong>👨‍🌾 Farmer</strong>
                            ${escapeHTML(
                request.farmerName
            )}
                        </div>

                        <div class="detail">
                            <strong>🛒 Buyer</strong>
                            ${escapeHTML(
                request.buyerName
            )}
                        </div>

                        <div class="detail">
                            <strong>📦 Quantity</strong>
                            ${request.quantity} KG
                        </div>

                        <div class="detail">
                            <strong>💰 Offer Price</strong>
                            <span class="offer-price">
                                ₹${request.offerPrice}/KG
                            </span>
                        </div>

                    </div>

                    <p>
                        📞 Buyer:
                        <strong>
                            ${escapeHTML(
                request.buyerPhone
            )}
                        </strong>
                    </p>

                    <p>
                        💵 Total:
                        <span class="total-price">
                            ₹${request.total}
                        </span>
                    </p>

                    <p>
                        📅
                        ${escapeHTML(
                request.createdAt
            )}
                    </p>

                    <div class="status ${statusClass}">
                        ${statusText}
                    </div>

                    ${buttons}

                </div>

            `;
        });
}


/* ================= ACCEPT ================= */

function acceptRequest(requestId) {

    if (
        !account ||
        account.role !== "farmer"
    ) {

        alert(
            "Only the farmer can accept a request."
        );

        return;
    }


    const request =
        requests.find(
            r =>
                Number(r.id) ===
                Number(requestId)
        );


    if (!request) {

        alert(
            "❌ Request not found."
        );

        return;
    }


    if (
        request.farmerName !==
        account.name
    ) {

        alert(
            "❌ You cannot accept this request."
        );

        return;
    }


    if (
        request.status !== "Pending"
    ) {

        alert(
            "This request has already been processed."
        );

        return;
    }


    const product =
        products.find(
            p =>
                Number(p.id) ===
                Number(request.productId)
        );


    if (!product) {

        alert(
            "❌ Crop not found."
        );

        return;
    }


    if (
        Number(product.remainingQuantity) <
        Number(request.quantity)
    ) {

        alert(
            "❌ Not enough crop quantity available."
        );

        return;
    }


    if (
        !confirm(
            "Accept this buyer offer?\n\n" +
            "Buyer: " +
            request.buyerName +
            "\nCrop: " +
            request.cropName +
            "\nQuantity: " +
            request.quantity +
            " KG" +
            "\nOffer: ₹" +
            request.offerPrice +
            "/KG" +
            "\nTotal: ₹" +
            request.total
        )
    ) return;


    request.status =
        "Accepted";

    request.acceptedAt =
        new Date().toLocaleString();


    product.remainingQuantity =
        Number(
            product.remainingQuantity
        ) -
        Number(
            request.quantity
        );


    const trade = {

        id: Date.now(),

        requestId:
            request.id,

        productId:
            request.productId,

        cropName:
            request.cropName,

        farmerName:
            request.farmerName,

        farmerPhone:
            request.farmerPhone,

        buyerName:
            request.buyerName,

        buyerPhone:
            request.buyerPhone,

        quantity:
            Number(request.quantity),

        price:
            Number(request.offerPrice),

        total:
            Number(request.total),

        date:
            new Date().toLocaleString(),

        farmerFeedback:
            null,

        buyerFeedback:
            null

    };


    trades.push(trade);


    /*
        AUTO DELETE WHEN STOCK = 0
    */

    if (
        Number(product.remainingQuantity) <= 0
    ) {

        products =
            products.filter(
                p =>
                    Number(p.id) !==
                    Number(product.id)
            );


        /*
            Reject remaining pending
            requests for this product
        */

        requests.forEach(r => {

            if (
                Number(r.productId) ===
                Number(product.id) &&
                r.status === "Pending"
            ) {

                r.status =
                    "Rejected";

                r.rejectedAt =
                    new Date().toLocaleString();
            }

        });

    }


    saveAll();


    notifyOtherUser(
        request.buyerName,
        "🤝 Trade Confirmed!",
        account.name +
        " accepted your request for " +
        request.cropName +
        ". Please give your rating & feedback."
    );


    alert(
        "✅ PRICE REQUEST ACCEPTED!\n\n" +
        "Buyer: " +
        request.buyerName +
        "\nCrop: " +
        request.cropName +
        "\nQuantity: " +
        request.quantity +
        " KG\n\n🤝 Trading Confirmed!"
    );


    displayProducts();

    displayRequests();

    displayTrades();

    updateBuyerOfferChart();

    updateNotificationCount();
}


/* ================= REJECT ================= */

function rejectRequest(requestId) {

    if (
        !account ||
        account.role !== "farmer"
    ) {

        alert(
            "Only the farmer can reject a request."
        );

        return;
    }


    const request =
        requests.find(
            r =>
                Number(r.id) ===
                Number(requestId)
        );


    if (!request) return;


    if (
        request.status !== "Pending"
    ) {

        alert(
            "This request has already been processed."
        );

        return;
    }


    if (
        !confirm(
            "Reject this buyer price request?"
        )
    ) return;


    request.status =
        "Rejected";

    request.rejectedAt =
        new Date().toLocaleString();


    saveAll();


    notifyOtherUser(
        request.buyerName,
        "❌ Request Rejected",
        "Your request for " +
        request.cropName +
        " was rejected by the farmer."
    );


    alert(
        "❌ Price request rejected."
    );


    displayRequests();

    updateBuyerOfferChart();

    updateNotificationCount();
}


/* ================= TRADING ================= */

function displayTrades() {

    const container =
        document.getElementById(
            "tradingList"
        );


    if (!container || !account)
        return;


    container.innerHTML = "";


    const visible =
        trades.filter(
            t =>
                t.farmerName ===
                account.name ||

                t.buyerName ===
                account.name
        );


    if (visible.length === 0) {

        container.innerHTML = `

            <div class="feature-card">
                🤝 No confirmed trading yet.
            </div>

        `;

        return;
    }


    visible
        .slice()
        .reverse()
        .forEach(trade => {

            const isFarmer =
                trade.farmerName ===
                account.name;


            const feedbackGiven =
                isFarmer
                    ? trade.farmerFeedback
                    : trade.buyerFeedback;


            let feedbackHTML = "";


            if (feedbackGiven) {

                feedbackHTML = `

                    <div class="feedback-complete">

                        ⭐ Rating:
                        ${feedbackGiven.rating}/5

                        <br>

                        💬
                        ${escapeHTML(
                    feedbackGiven.comment
                )}

                    </div>

                `;

            } else {

                feedbackHTML = `

                    <div class="feedback-box">

                        <h3>
                            ⭐ Give Rating & Feedback
                        </h3>

                        <select id="rating-${trade.id}">
                            <option value="5">
                                ⭐⭐⭐⭐⭐ 5
                            </option>
                            <option value="4">
                                ⭐⭐⭐⭐ 4
                            </option>
                            <option value="3">
                                ⭐⭐⭐ 3
                            </option>
                            <option value="2">
                                ⭐⭐ 2
                            </option>
                            <option value="1">
                                ⭐ 1
                            </option>
                        </select>

                        <textarea
                            id="feedback-${trade.id}"
                            placeholder="Write your feedback..."
                            rows="3"
                        ></textarea>

                        <button
                            class="feedback-btn"
                            onclick="submitFeedback(${trade.id})"
                        >
                            ⭐ Submit Feedback
                        </button>

                    </div>

                `;
            }


            container.innerHTML += `

                <div class="trade-card">

                    <h3>
                        🤝
                        ${escapeHTML(
                trade.cropName
            )}
                    </h3>

                    <p>
                        👨‍🌾 Farmer:
                        <strong>
                            ${escapeHTML(
                trade.farmerName
            )}
                        </strong>
                    </p>

                    <p>
                        🛒 Buyer:
                        <strong>
                            ${escapeHTML(
                trade.buyerName
            )}
                        </strong>
                    </p>

                    <p>
                        📦 Quantity:
                        <strong>
                            ${trade.quantity} KG
                        </strong>
                    </p>

                    <p>
                        💰 Price:
                        <strong>
                            ₹${trade.price}/KG
                        </strong>
                    </p>

                    <p>
                        💵 Total:
                        <strong>
                            ₹${trade.total}
                        </strong>
                    </p>

                    <div class="trade-success">

                        ✅ TRADING CONFIRMED

                        <br><br>

                        📅
                        ${escapeHTML(
                trade.date
            )}

                    </div>

                    ${feedbackHTML}

                </div>

            `;
        });
}


/* ================= FEEDBACK ================= */

function submitFeedback(tradeId) {

    if (!account) return;


    const trade =
        trades.find(
            t =>
                Number(t.id) ===
                Number(tradeId)
        );


    if (!trade) {

        alert(
            "❌ Trade not found."
        );

        return;
    }


    const rating =
        Number(
            document.getElementById(
                "rating-" + tradeId
            ).value
        );


    const comment =
        document.getElementById(
            "feedback-" + tradeId
        ).value.trim();


    if (!comment) {

        alert(
            "Please enter your feedback."
        );

        return;
    }


    const feedback = {

        rating,

        comment,

        from:
            account.name,

        date:
            new Date().toLocaleString()

    };


    if (
        account.name ===
        trade.farmerName
    ) {

        trade.farmerFeedback =
            feedback;

    } else if (
        account.name ===
        trade.buyerName
    ) {

        trade.buyerFeedback =
            feedback;

    } else {

        alert(
            "❌ You are not part of this trade."
        );

        return;
    }


    /*
        Add rating to the other person's profile.
    */

    let targetName =
        account.name ===
            trade.farmerName

            ? trade.buyerName

            : trade.farmerName;


    /*
        Single-account demo:
        We store rating in local feedback
        records for the target user.
    */

    const allRatings =
        readData(
            "tnRatings",
            []
        );


    allRatings.push({

        id: Date.now(),

        target:
            targetName,

        from:
            account.name,

        rating,

        comment,

        tradeId,

        date:
            new Date().toLocaleString()

    });


    writeData(
        "tnRatings",
        allRatings
    );


    saveAll();


    notifyOtherUser(
        targetName,
        "⭐ New Feedback Received",
        account.name +
        " gave you " +
        rating +
        "/5 rating."
    );


    alert(
        "⭐ Feedback submitted successfully!"
    );


    displayTrades();

    updateProfileUI();
}


/* ================= PROFILE ================= */

function editProfile() {

    const box =
        document.getElementById(
            "profileEditBox"
        );


    box.classList.remove(
        "hidden"
    );


    document.getElementById(
        "profileName"
    ).value =
        account.name || "";


    document.getElementById(
        "profilePhone"
    ).value =
        account.phone || "";


    document.getElementById(
        "profileThought"
    ).value =
        account.thought || "";


    document.getElementById(
        "profileUPI"
    ).value =
        account.upi || "";


    document.getElementById(
        "profileBank"
    ).value =
        account.bankAccount || "";


    document.getElementById(
        "profileIFSC"
    ).value =
        account.ifsc || "";
}


function closeProfileEdit() {

    document
        .getElementById(
            "profileEditBox"
        )
        .classList.add(
            "hidden"
        );
}


function uploadUPIQR(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = e => {

        currentUPIQR =
            e.target.result;

    };


    reader.readAsDataURL(file);
}


function saveProfile() {

    account.name =
        document.getElementById(
            "profileName"
        ).value.trim();


    account.phone =
        document.getElementById(
            "profilePhone"
        ).value.trim();


    account.thought =
        document.getElementById(
            "profileThought"
        ).value.trim();


    account.upi =
        document.getElementById(
            "profileUPI"
        ).value.trim();


    account.bankAccount =
        document.getElementById(
            "profileBank"
        ).value.trim();


    account.ifsc =
        document.getElementById(
            "profileIFSC"
        ).value.trim();


    if (currentUPIQR) {

        account.upiQR =
            currentUPIQR;
    }


    /*
        Update old farmer name
        inside products/requests/trades
    */

    const oldName =
        readData(
            "tnOldAccountName",
            account.name
        );


    products.forEach(p => {

        if (
            p.farmerName ===
            oldName
        ) {

            p.farmerName =
                account.name;
        }
    });


    requests.forEach(r => {

        if (
            r.farmerName ===
            oldName
        ) {

            r.farmerName =
                account.name;
        }
    });


    trades.forEach(t => {

        if (
            t.farmerName ===
            oldName
        ) {

            t.farmerName =
                account.name;
        }
    });


    saveAll();


    closeProfileEdit();

    updateProfileUI();

    displayProducts();

    displayRequests();

    displayTrades();


    alert(
        "✅ Profile updated successfully!"
    );
}


function updateProfileUI() {

    if (!account) return;


    document.getElementById(
        "accountName"
    ).textContent =
        account.name;


    document.getElementById(
        "accountPhone"
    ).textContent =
        account.phone;


    document.getElementById(
        "accountRole"
    ).textContent =
        account.role === "farmer"
            ? "👨‍🌾 Farmer"
            : "🛒 Buyer";


    document.getElementById(
        "accountThought"
    ).textContent =
        account.thought ||
        "No thoughts added yet.";


    document.getElementById(
        "accountUPI"
    ).textContent =
        account.upi ||
        "Not added";


    document.getElementById(
        "accountBank"
    ).textContent =
        account.bankAccount ||
        "Not added";


    document.getElementById(
        "accountIFSC"
    ).textContent =
        account.ifsc ||
        "Not added";


    const qrBox =
        document.getElementById(
            "upiQRBox"
        );


    if (
        account.upiQR
    ) {

        qrBox.innerHTML = `

            <p><strong>📱 UPI QR</strong></p>

            <img
                src="${account.upiQR}"
                alt="UPI QR"
            >

        `;

    } else {

        qrBox.innerHTML =
            "<p>📱 UPI QR not added</p>";
    }


    updateProfileRating();
}


function showProfile(role) {

    if (!account) return;


    if (
        role !==
        account.role
    ) {

        alert(
            "This profile section belongs to another account type."
        );

        return;
    }


    updateProfileUI();
}


function updateProfileRating() {

    const ratings =
        readData(
            "tnRatings",
            []
        );


    const received =
        ratings.filter(
            r =>
                r.target ===
                account.name
        );


    const box =
        document.getElementById(
            "profileRating"
        );


    if (received.length === 0) {

        box.textContent =
            "No ratings yet.";

        return;
    }


    const total =
        received.reduce(
            (sum, r) =>
                sum +
                Number(r.rating),
            0
        );


    const average =
        (
            total /
            received.length
        ).toFixed(1);


    box.innerHTML = `

        ⭐
        <strong>
            ${average}/5
        </strong>

        <br>

        ${received.length}
        rating(s)

    `;
}


/* ================= EDIT / DELETE ================= */

function editProduct(id) {

    const product =
        products.find(
            p =>
                Number(p.id) ===
                Number(id)
        );


    if (!product) return;


    const name =
        prompt(
            "Crop Name:",
            product.cropName
        );


    if (name === null) return;


    const quantity =
        Number(
            prompt(
                "Available Quantity:",
                product.remainingQuantity
            )
        );


    const price =
        Number(
            prompt(
                "Farmer Price / KG:",
                product.price
            )
        );


    if (
        !name.trim() ||
        quantity <= 0 ||
        price <= 0
    ) {

        alert(
            "Invalid values."
        );

        return;
    }


    product.cropName =
        name.trim();


    product.quantity =
        quantity;


    product.remainingQuantity =
        quantity;


    product.price =
        price;


    saveAll();

    displayProducts();
}


function deleteProduct(id) {

    if (
        !confirm(
            "Delete this crop?"
        )
    ) return;


    products =
        products.filter(
            p =>
                Number(p.id) !==
                Number(id)
        );


    requests =
        requests.filter(
            r =>
                Number(r.productId) !==
                Number(id) ||
                r.status !==
                "Pending"
        );


    saveAll();

    displayProducts();

    displayRequests();
}


/* ================= AUTO STOCK ================= */

function cleanupZeroStock() {

    const zeroProducts =
        products.filter(
            p =>
                Number(
                    p.remainingQuantity
                ) <= 0
        );


    if (
        zeroProducts.length === 0
    ) return;


    const zeroIds =
        zeroProducts.map(
            p =>
                Number(p.id)
        );


    products =
        products.filter(
            p =>
                !zeroIds.includes(
                    Number(p.id)
                )
        );


    requests.forEach(r => {

        if (
            zeroIds.includes(
                Number(r.productId)
            ) &&
            r.status === "Pending"
        ) {

            r.status =
                "Rejected";
        }

    });


    saveAll();
}


/* ================= CHART ================= */

function updateBuyerOfferChart() {

    const chart =
        document.getElementById(
            "buyerOfferChart"
        );


    const empty =
        document.getElementById(
            "chartEmpty"
        );


    if (
        !chart ||
        !account ||
        account.role !== "farmer"
    ) return;


    const data =
        requests.filter(
            r =>
                r.farmerName ===
                account.name
        );


    if (data.length === 0) {

        chart.innerHTML = "";

        empty.style.display =
            "block";


        document.getElementById(
            "chartBuyerCount"
        ).textContent = "0";


        document.getElementById(
            "chartQuantity"
        ).textContent = "0 KG";


        document.getElementById(
            "chartBestOffer"
        ).textContent = "₹0/KG";


        return;
    }


    empty.style.display =
        "none";


    const highest =
        Math.max(
            ...data.map(
                r =>
                    Number(
                        r.offerPrice || 0
                    )
            )
        );


    const totalQuantity =
        data.reduce(
            (sum, r) =>
                sum +
                Number(
                    r.quantity || 0
                ),
            0
        );


    document.getElementById(
        "chartBuyerCount"
    ).textContent =
        data.length;


    document.getElementById(
        "chartQuantity"
    ).textContent =
        totalQuantity +
        " KG";


    document.getElementById(
        "chartBestOffer"
    ).textContent =
        "₹" +
        highest +
        "/KG";


    chart.innerHTML = "";


    data
        .slice()
        .sort(
            (a, b) =>
                Number(b.offerPrice) -
                Number(a.offerPrice)
        )
        .forEach(request => {

            const price =
                Number(
                    request.offerPrice || 0
                );


            const height =
                Math.max(
                    10,
                    (price / highest) *
                    230
                );


            const best =
                price === highest;


            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "chart-column";


            column.innerHTML = `

                <div
                    class="chart-bar ${best ? "best" : ""
                }"
                    style="height:${height}px"
                >

                    <span class="chart-price">
                        ₹${price}/KG
                    </span>

                    <span class="chart-buyer">
                        🛒
                        ${escapeHTML(
                    request.buyerName
                )}
                    </span>

                    <span class="chart-quantity">
                        ${request.quantity} KG
                    </span>

                </div>

            `;


            chart.appendChild(
                column
            );

        });
}


/* ================= REAL-TIME NOTIFICATION ================= */

/*
    localStorage storage event works
    between two browser tabs/windows
    using the same browser storage.
*/

function notifyOtherUser(
    targetUser,
    title,
    message
) {

    localStorage.setItem(
        "tnRealtimeNotification",
        JSON.stringify({

            targetUser,

            title,

            message,

            time:
                Date.now()

        })
    );
}


window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key !==
            "tnRealtimeNotification"
        ) return;


        if (!event.newValue)
            return;


        try {

            const data =
                JSON.parse(
                    event.newValue
                );


            if (
                account &&
                data.targetUser ===
                account.name
            ) {

                showNotification(
                    data.title,
                    data.message
                );

                updateNotificationCount();

                displayRequests();

                displayTrades();

                displayProducts();

            }

        } catch (e) {
            console.log(e);
        }

    }
);


function showNotification(
    title,
    message
) {

    const box =
        document.getElementById(
            "notificationBox"
        );


    document.getElementById(
        "notificationTitle"
    ).textContent =
        title;


    document.getElementById(
        "notificationText"
    ).textContent =
        message;


    box.classList.remove(
        "hidden"
    );


    setTimeout(() => {

        box.classList.add(
            "hidden"
        );

    }, 5000);
}


function updateNotificationCount() {

    if (!account) return;


    const count =
        requests.filter(
            r =>
                account.role === "farmer"

                    ?

                    (
                        r.farmerName ===
                        account.name &&
                        r.status ===
                        "Pending"
                    )

                    :

                    (
                        r.buyerName ===
                        account.name &&
                        r.status ===
                        "Accepted"
                    )
        ).length;


    const el =
        document.getElementById(
            "notificationCount"
        );


    if (el) {
        el.textContent =
            count;
    }
}


/* ================= SAVE ================= */

function saveAll() {

    writeData(
        "tnAccount",
        account
    );

    writeData(
        "tnProducts",
        products
    );

    writeData(
        "tnRequests",
        requests
    );

    writeData(
        "tnTrades",
        trades
    );
}


/* ================= HELPERS ================= */

function showMessage(
    id,
    message,
    color
) {

    const el =
        document.getElementById(id);


    if (el) {

        el.innerHTML = `

            <div
                style="
                    color:${color};
                    font-weight:bold;
                    margin-top:10px
                "
            >
                ${message}
            </div>

        `;
    }
}


function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        account =
            readData(
                "tnAccount",
                null
            );


        products =
            readData(
                "tnProducts",
                []
            );


        requests =
            readData(
                "tnRequests",
                []
            );


        trades =
            readData(
                "tnTrades",
                []
            );


        if (!account) {

            localStorage.removeItem(
                "tnLoggedIn"
            );

            showCreate();

            return;
        }


        if (
            localStorage.getItem(
                "tnLoggedIn"
            ) === "true"
        ) {

            openApp();

        } else {

            showLogin();

        }

    }
);
