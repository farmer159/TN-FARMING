/* =====================================================
   TN FARMING
   விவசாயிகளுக்கான நவீன சந்தை
   ===================================================== */

let selectedRole = "farmer";
let currentUser = null;


/* ================= STORAGE ================= */

let users =
    JSON.parse(localStorage.getItem("tn_users")) || [];

let crops =
    JSON.parse(localStorage.getItem("tn_crops")) || [];

let requests =
    JSON.parse(localStorage.getItem("tn_requests")) || [];

let feedbacks =
    JSON.parse(localStorage.getItem("tn_feedbacks")) || [];


/* ================= ROLE ================= */

function selectRole(role) {

    selectedRole = role;

    document.getElementById("farmerBtn")
        .classList.remove("active");

    document.getElementById("buyerBtn")
        .classList.remove("active");

    if (role === "farmer") {

        document.getElementById("farmerBtn")
            .classList.add("active");

    } else {

        document.getElementById("buyerBtn")
            .classList.add("active");
    }
}

selectRole("farmer");


/* ================= SHOW PASSWORD ================= */

function togglePassword() {

    const password =
        document.getElementById("loginPassword");

    if (password.type === "password") {

        password.type = "text";

    } else {

        password.type = "password";
    }
}


/* ================= LOGIN ================= */

function login() {

    const name =
        document.getElementById("loginName")
            .value.trim();

    const phone =
        document.getElementById("loginPhone")
            .value.trim();

    const password =
        document.getElementById("loginPassword")
            .value.trim();


    if (!name || !phone || !password) {

        showToast(
            "Please fill all details / அனைத்து விவரங்களையும் நிரப்பவும்"
        );

        return;
    }


    let user =
        users.find(
            u =>
                u.phone === phone &&
                u.role === selectedRole
        );


    if (!user) {

        user = {

            id: Date.now().toString(),

            name: name,

            phone: phone,

            password: password,

            role: selectedRole,

            address: "",

            upi: "",

            qr: "",

            bank: "",

            ifsc: "",

            thoughts: "",

            photo: ""
        };


        users.push(user);

        saveUsers();

    } else {

        if (user.password !== password) {

            showToast(
                "Wrong password / தவறான கடவுச்சொல்"
            );

            return;
        }
    }


    currentUser = user;


    document.getElementById("loginPage")
        .classList.add("hidden");

    document.getElementById("app")
        .classList.remove("hidden");


    document.getElementById("welcomeUser")
        .textContent =
        `${currentUser.role === "farmer"
            ? "👨‍🌾"
            : "🛒"} ${currentUser.name}`;


    document.getElementById("dashboardWelcome")
        .innerHTML =
        `Welcome ${currentUser.name}! /
         வரவேற்கிறோம் ${currentUser.name}!`;


    setupNavigation();

    loadProfile();

    updateDashboard();

    showSection("dashboard");
}


/* ================= LOGOUT ================= */

function logout() {

    currentUser = null;

    document.getElementById("app")
        .classList.add("hidden");

    document.getElementById("loginPage")
        .classList.remove("hidden");

    document.getElementById("loginPassword")
        .value = "";
}


/* ================= NAVIGATION ================= */

function setupNavigation() {

    const isFarmer =
        currentUser.role === "farmer";


    document.getElementById("farmerCropNav")
        .style.display =
        isFarmer ? "block" : "none";


    document.getElementById("buyerBrowseNav")
        .style.display =
        isFarmer ? "none" : "block";


    document.getElementById("farmerQuick")
        .style.display =
        isFarmer ? "block" : "none";


    document.getElementById("buyerQuick")
        .style.display =
        isFarmer ? "none" : "block";
}


function showSection(sectionId) {

    document.querySelectorAll(".section")
        .forEach(section => {

            section.classList.add("hidden");

        });


    document.getElementById(sectionId)
        .classList.remove("hidden");


    if (sectionId === "myCrops")
        renderMyCrops();

    if (sectionId === "browse")
        renderBrowse();

    if (sectionId === "requests")
        renderRequests();

    if (sectionId === "feedback")
        renderFeedback();
}


/* ================= PROFILE ================= */

function loadProfile() {

    document.getElementById("profileHeading")
        .textContent =
        currentUser.role === "farmer"

            ? "👨‍🌾 Farmer Profile / விவசாயி சுயவிவரம்"

            : "🛒 Buyer Profile / வாங்குபவர் சுயவிவரம்";


    document.getElementById("profileName")
        .value =
        currentUser.name || "";


    document.getElementById("profilePhone")
        .value =
        currentUser.phone || "";


    document.getElementById("profileAddress")
        .value =
        currentUser.address || "";


    document.getElementById("upiId")
        .value =
        currentUser.upi || "";


    document.getElementById("bankAccount")
        .value =
        currentUser.bank || "";


    document.getElementById("ifsc")
        .value =
        currentUser.ifsc || "";


    document.getElementById("farmerThoughts")
        .value =
        currentUser.thoughts || "";


    document.getElementById("farmerThoughtArea")
        .style.display =
        currentUser.role === "farmer"
            ? "block"
            : "none";


    document.getElementById("profileImage")
        .src =
        currentUser.photo ||
        "https://via.placeholder.com/180?text=Profile";


    document.getElementById("qrPreview")
        .src =
        currentUser.qr || "";
}


/* ================= SAVE PROFILE ================= */

function saveProfile() {

    currentUser.name =
        document.getElementById("profileName")
            .value.trim();


    currentUser.phone =
        document.getElementById("profilePhone")
            .value.trim();


    currentUser.address =
        document.getElementById("profileAddress")
            .value.trim();


    currentUser.upi =
        document.getElementById("upiId")
            .value.trim();


    currentUser.bank =
        document.getElementById("bankAccount")
            .value.trim();


    currentUser.ifsc =
        document.getElementById("ifsc")
            .value.trim();


    currentUser.thoughts =
        document.getElementById("farmerThoughts")
            .value.trim();


    const index =
        users.findIndex(
            u => u.id === currentUser.id
        );


    if (index !== -1)
        users[index] = currentUser;


    saveUsers();


    document.getElementById("welcomeUser")
        .textContent =
        `👤 ${currentUser.name}`;


    showToast(
        "Profile saved / சுயவிவரம் சேமிக்கப்பட்டது"
    );
}


/* ================= PROFILE PHOTO ================= */

function uploadProfilePhoto(event) {

    const file =
        event.target.files[0];

    if (!file)
        return;


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            currentUser.photo =
                event.target.result;

            document.getElementById("profileImage")
                .src =
                event.target.result;
        };


    reader.readAsDataURL(file);
}


/* ================= QR ================= */

function uploadQR(event) {

    const file =
        event.target.files[0];

    if (!file)
        return;


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            currentUser.qr =
                event.target.result;

            document.getElementById("qrPreview")
                .src =
                event.target.result;
        };


    reader.readAsDataURL(file);
}


/* ================= CROP MODAL ================= */

function openCropModal() {

    document.getElementById("cropModal")
        .classList.remove("hidden");
}


function closeCropModal() {

    document.getElementById("cropModal")
        .classList.add("hidden");
}


/* ================= POST CROP ================= */

function postCrop() {

    const name =
        document.getElementById("cropName")
            .value.trim();

    const price =
        Number(
            document.getElementById("cropPrice")
                .value
        );

    const stock =
        Number(
            document.getElementById("cropStock")
                .value
        );

    const imageFile =
        document.getElementById("cropImage")
            .files[0];


    if (!name || price <= 0 || stock <= 0) {

        showToast(
            "Enter valid crop details / சரியான பயிர் விவரங்களை உள்ளிடவும்"
        );

        return;
    }


    const crop = {

        id: Date.now().toString(),

        farmerId:
            currentUser.id,

        farmerName:
            currentUser.name,

        name:
            name,

        price:
            price,

        stock:
            stock,

        image:
            "",

        createdAt:
            new Date().toISOString()
    };


    if (imageFile) {

        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                crop.image =
                    event.target.result;

                crops.push(crop);

                saveCrops();

                finishCropPost();
            };


        reader.readAsDataURL(imageFile);

    } else {

        crops.push(crop);

        saveCrops();

        finishCropPost();
    }
}


function finishCropPost() {

    document.getElementById("cropName")
        .value = "";

    document.getElementById("cropPrice")
        .value = "";

    document.getElementById("cropStock")
        .value = "";

    document.getElementById("cropImage")
        .value = "";


    closeCropModal();

    renderMyCrops();

    updateDashboard();


    showToast(
        "Crop posted / பயிர் பதிவு செய்யப்பட்டது 🌱"
    );
}


/* ================= MY CROPS ================= */

function renderMyCrops() {

    const container =
        document.getElementById(
            "myCropContainer"
        );


    const myCrops =
        crops.filter(
            c =>
                c.farmerId === currentUser.id
        );


    if (!myCrops.length) {

        container.innerHTML = `
            <div class="request-card">
                <h3>
                    No crops posted /
                    இன்னும் பயிர்கள் பதிவு செய்யப்படவில்லை
                </h3>
            </div>
        `;

        return;
    }


    container.innerHTML =
        myCrops
            .map(crop => farmerCropCard(crop))
            .join("");
}


function farmerCropCard(crop) {

    const image =
        crop.image ||
        "https://via.placeholder.com/500x300?text=Crop";


    const cropRequests =
        requests.filter(
            r =>
                r.cropId === crop.id
        );


    const activeRequests =
        cropRequests.filter(
            r =>
                r.status !== "rejected"
        );


    const totalDemand =
        activeRequests.reduce(
            (sum, r) =>
                sum + Number(r.quantity),
            0
        );


    return `

        <div class="product-card">

            <img class="product-image"
                 src="${image}">

            <div class="product-content">

                <h3>
                    🌱 ${crop.name}
                </h3>

                <div class="price">
                    ₹${crop.price} / kg
                </div>

                <div class="stock">
                    📦 Available Stock /
                    கிடைக்கும் கையிருப்பு:
                    ${crop.stock} kg
                </div>

                <div class="trading-box">

                    <h4>
                        📊 Trading / வர்த்தகம்
                    </h4>

                    <div class="demand">
                        Total Demand /
                        மொத்த தேவை:
                        ${totalDemand} kg
                    </div>

                    <p>
                        Requests /
                        கோரிக்கைகள்:
                        ${cropRequests.length}
                    </p>

                    ${cropRequests.length

            ?

            cropRequests.map(
                (r, index) => `

                            <div class="request-row">

                                <span>
                                    Buyer ${index + 1}
                                </span>

                                <strong>
                                    ${r.quantity} kg
                                </strong>

                            </div>

                        `
            ).join("")

            :

            `
                        <p>
                            No requests yet /
                            இன்னும் கோரிக்கைகள் இல்லை
                        </p>
                        `
        }

                </div>


                <button class="primary-btn"
                        onclick="showSection('requests')">

                    📋 View Requests /
                    கோரிக்கைகளைப் பார்க்க

                </button>

            </div>

        </div>
    `;
}


/* ================= BROWSE ================= */

function renderBrowse() {

    const container =
        document.getElementById(
            "browseContainer"
        );


    const search =
        document.getElementById(
            "searchInput"
        )
            .value
            .toLowerCase();


    const availableCrops =
        crops.filter(
            crop =>

                crop.stock > 0 &&

                (
                    crop.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    crop.farmerName
                        .toLowerCase()
                        .includes(search)
                )
        );


    if (!availableCrops.length) {

        container.innerHTML = `
            <div class="request-card">

                <h3>
                    No crops available /
                    பயிர்கள் கிடைக்கவில்லை
                </h3>

            </div>
        `;

        return;
    }


    container.innerHTML =
        availableCrops
            .map(crop => buyerCropCard(crop))
            .join("");
}


function buyerCropCard(crop) {

    const image =
        crop.image ||
        "https://via.placeholder.com/500x300?text=Crop";


    const activeRequests =
        requests.filter(
            r =>
                r.cropId === crop.id &&
                r.status !== "rejected"
        );


    const totalDemand =
        activeRequests.reduce(
            (sum, r) =>
                sum + Number(r.quantity),
            0
        );


    return `

        <div class="product-card">

            <img class="product-image"
                 src="${image}">


            <div class="product-content">

                <h3>
                    🌱 ${crop.name}
                </h3>

                <p>
                    👨‍🌾 Farmer / விவசாயி:
                    ${crop.farmerName}
                </p>


                <div class="price">
                    ₹${crop.price} / kg
                </div>


                <div class="stock">
                    📦 Available /
                    கிடைக்கும் கையிருப்பு:
                    ${crop.stock} kg
                </div>


                <!-- TRADING -->

                <div class="trading-box">

                    <h4>
                        📊 Buyer Demand /
                        வாங்குபவர் தேவை
                    </h4>

                    <div class="demand">
                        ${totalDemand} kg
                        requested /
                        கோரப்பட்டுள்ளது
                    </div>


                    ${activeRequests.length

            ?

            activeRequests
                .map(
                    (r, index) => `

                                <div class="request-row">

                                    <span>
                                        Buyer ${index + 1}
                                    </span>

                                    <strong>
                                        ${r.quantity} kg
                                    </strong>

                                </div>

                            `
                )
                .join("")

            :

            `
                        <p>
                            No requests yet /
                            இன்னும் கோரிக்கைகள் இல்லை
                        </p>
                        `
        }

                </div>


                <input
                    id="quantity-${crop.id}"
                    class="quantity-input"
                    type="number"
                    min="1"
                    max="${crop.stock}"
                    placeholder="Required kg / தேவையான கிலோ">


                <button class="primary-btn"
                        onclick="sendRequest('${crop.id}')">

                    🛒 Request Product /
                    பொருளைக் கோருங்கள்

                </button>

            </div>

        </div>
    `;
}


/* ================= SEND REQUEST ================= */

function sendRequest(cropId) {

    const crop =
        crops.find(
            c =>
                c.id === cropId
        );


    if (!crop || crop.stock <= 0) {

        showToast(
            "Product unavailable / பொருள் கிடைக்கவில்லை"
        );

        return;
    }


    const input =
        document.getElementById(
            `quantity-${cropId}`
        );


    const quantity =
        Number(input.value);


    if (!quantity || quantity <= 0) {

        showToast(
            "Enter quantity / அளவை உள்ளிடவும்"
        );

        return;
    }


    if (quantity > crop.stock) {

        showToast(
            `Only ${crop.stock} kg available`
        );

        return;
    }


    requests.push({

        id:
            Date.now().toString(),

        cropId:
            crop.id,

        farmerId:
            crop.farmerId,

        farmerName:
            crop.farmerName,

        buyerId:
            currentUser.id,

        buyerName:
            currentUser.name,

        quantity:
            quantity,

        status:
            "pending",

        completed:
            false,

        createdAt:
            new Date().toISOString()
    });


    saveRequests();


    showToast(
        "Request sent / கோரிக்கை அனுப்பப்பட்டது 🛒"
    );


    renderBrowse();

    updateDashboard();
}


/* ================= REQUESTS ================= */

function renderRequests() {

    const container =
        document.getElementById(
            "requestContainer"
        );


    let list;


    if (currentUser.role === "farmer") {

        list =
            requests.filter(
                r =>
                    r.farmerId === currentUser.id
            );

    } else {

        list =
            requests.filter(
                r =>
                    r.buyerId === currentUser.id
            );
    }


    if (!list.length) {

        container.innerHTML = `
            <div class="request-card">

                <h3>
                    No requests /
                    கோரிக்கைகள் இல்லை
                </h3>

            </div>
        `;

        return;
    }


    container.innerHTML =
        list
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .map(r => requestCard(r))
            .join("");
}


function requestCard(request) {

    const crop =
        crops.find(
            c =>
                c.id === request.cropId
        );


    const cropName =
        crop
            ? crop.name
            : "Completed Product / முடிந்த பொருள்";


    return `

        <div class="request-card">

            <h3>
                🌱 ${cropName}
            </h3>


            ${currentUser.role === "farmer"

            ?

            `
                <p>
                    🛒 Buyer / வாங்குபவர்:
                    ${request.buyerName}
                </p>
                `

            :

            `
                <p>
                    👨‍🌾 Farmer / விவசாயி:
                    ${request.farmerName}
                </p>
                `
        }


            <p>
                📦 Quantity / அளவு:
                <strong>
                    ${request.quantity} kg
                </strong>
            </p>


            <p>
                Status / நிலை:
                <strong class="${request.status}">
                    ${getStatusText(request.status)}
                </strong>
            </p>


            ${currentUser.role === "farmer" &&
            request.status === "pending"

            ?

            `
                <div class="request-actions">

                    <button class="accept-btn"
                            onclick="acceptRequest('${request.id}')">

                        ✅ Accept / ஏற்கவும்

                    </button>


                    <button class="reject-btn"
                            onclick="rejectRequest('${request.id}')">

                        ❌ Reject / நிராகரிக்கவும்

                    </button>

                </div>
                `

            :

            ""
        }

        </div>
    `;
}


function getStatusText(status) {

    if (status === "pending")
        return "PENDING / நிலுவையில்";

    if (status === "accepted")
        return "ACCEPTED / ஏற்கப்பட்டது";

    if (status === "rejected")
        return "REJECTED / நிராகரிக்கப்பட்டது";

    return status;
}


/* ================= ACCEPT ================= */

function acceptRequest(requestId) {

    const request =
        requests.find(
            r =>
                r.id === requestId
        );


    if (!request ||
        request.status !== "pending")
        return;


    const crop =
        crops.find(
            c =>
                c.id === request.cropId
        );


    if (!crop) {

        showToast(
            "Product unavailable / பொருள் கிடைக்கவில்லை"
        );

        return;
    }


    if (request.quantity > crop.stock) {

        showToast(
            "Not enough stock / போதுமான கையிருப்பு இல்லை"
        );

        return;
    }


    /* REDUCE STOCK */

    crop.stock -=
        Number(request.quantity);


    request.status =
        "accepted";

    request.completed =
        true;

    request.completedAt =
        new Date().toISOString();


    saveCrops();

    saveRequests();


    /* AUTO DELETE WHEN STOCK = 0 */

    if (crop.stock === 0) {

        crops =
            crops.filter(
                c =>
                    c.id !== crop.id
            );

        saveCrops();


        showToast(
            "Stock 0. Product automatically deleted / கையிருப்பு 0. பொருள் தானாக நீக்கப்பட்டது 🗑️"
        );

    } else {

        showToast(
            `Request accepted / கோரிக்கை ஏற்கப்பட்டது. Remaining: ${crop.stock} kg`
        );
    }


    renderRequests();

    updateDashboard();
}


/* ================= REJECT ================= */

function rejectRequest(requestId) {

    const request =
        requests.find(
            r =>
                r.id === requestId
        );


    if (!request)
        return;


    request.status =
        "rejected";


    saveRequests();


    showToast(
        "Request rejected / கோரிக்கை நிராகரிக்கப்பட்டது ❌"
    );


    renderRequests();

    updateDashboard();
}


/* ================= FEEDBACK ================= */

function renderFeedback() {

    const select =
        document.getElementById(
            "feedbackRequest"
        );


    let completed;


    if (currentUser.role === "buyer") {

        completed =
            requests.filter(
                r =>
                    r.buyerId === currentUser.id &&
                    r.status === "accepted"
            );

    } else {

        completed =
            requests.filter(
                r =>
                    r.farmerId === currentUser.id &&
                    r.status === "accepted"
            );
    }


    select.innerHTML = `
        <option value="">
            Select Transaction /
            பரிவர்த்தனையை தேர்வு செய்க
        </option>
    `;


    completed.forEach(request => {

        const already =
            feedbacks.some(
                f =>
                    f.requestId === request.id &&
                    f.fromId === currentUser.id
            );


        if (!already) {

            const option =
                document.createElement("option");

            option.value =
                request.id;

            option.textContent =
                `${request.farmerName} - ${request.quantity} kg`;

            select.appendChild(option);
        }

    });


    const myFeedback =
        feedbacks.filter(
            f =>
                f.fromId === currentUser.id
        );


    const container =
        document.getElementById(
            "feedbackContainer"
        );


    if (!myFeedback.length) {

        container.innerHTML = `
            <div class="feedback-card">
                No feedback yet /
                இன்னும் மதிப்பீடுகள் இல்லை
            </div>
        `;

        return;
    }


    container.innerHTML =
        myFeedback
            .map(
                feedback => `

                <div class="feedback-card">

                    <div class="stars">
                        ${"⭐".repeat(feedback.rating)}
                    </div>

                    <p>
                        ${feedback.comment}
                    </p>

                </div>
            `
            )
            .join("");
}


/* ================= SUBMIT FEEDBACK ================= */

function submitFeedback() {

    const requestId =
        document.getElementById(
            "feedbackRequest"
        ).value;


    const rating =
        Number(
            document.getElementById(
                "feedbackRating"
            ).value
        );


    const comment =
        document.getElementById(
            "feedbackComment"
        ).value.trim();


    if (!requestId || !comment) {

        showToast(
            "Select transaction and write feedback"
        );

        return;
    }


    const request =
        requests.find(
            r =>
                r.id === requestId
        );


    if (!request ||
        request.status !== "accepted") {

        showToast(
            "Only completed transactions can be rated"
        );

        return;
    }


    const exists =
        feedbacks.some(
            f =>
                f.requestId === requestId &&
                f.fromId === currentUser.id
        );


    if (exists) {

        showToast(
            "Feedback already submitted"
        );

        return;
    }


    const targetId =
        currentUser.role === "farmer"
            ? request.buyerId
            : request.farmerId;


    feedbacks.push({

        id:
            Date.now().toString(),

        requestId:
            requestId,

        fromId:
            currentUser.id,

        fromName:
            currentUser.name,

        toId:
            targetId,

        rating:
            rating,

        comment:
            comment,

        createdAt:
            new Date().toISOString()
    });


    saveFeedbacks();


    document.getElementById(
        "feedbackComment"
    ).value = "";


    showToast(
        "Feedback submitted / மதிப்பீடு சமர்ப்பிக்கப்பட்டது ⭐"
    );


    renderFeedback();

    updateDashboard();
}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    let productCount = 0;

    let stockCount = 0;

    let requestCount = 0;


    if (currentUser.role === "farmer") {

        const myCrops =
            crops.filter(
                c =>
                    c.farmerId === currentUser.id
            );


        productCount =
            myCrops.length;


        stockCount =
            myCrops.reduce(
                (sum, crop) =>
                    sum + Number(crop.stock),
                0
            );


        requestCount =
            requests.filter(
                r =>
                    r.farmerId === currentUser.id
            ).length;

    } else {

        productCount =
            crops.length;


        stockCount =
            crops.reduce(
                (sum, crop) =>
                    sum + Number(crop.stock),
                0
            );


        requestCount =
            requests.filter(
                r =>
                    r.buyerId === currentUser.id
            ).length;
    }


    const ratings =
        feedbacks.filter(
            f =>
                f.toId === currentUser.id
        );


    let averageRating = 0;


    if (ratings.length) {

        averageRating =
            (
                ratings.reduce(
                    (sum, f) =>
                        sum + Number(f.rating),
                    0
                )
                /
                ratings.length
            ).toFixed(1);
    }


    document.getElementById(
        "productCount"
    ).textContent =
        productCount;


    document.getElementById(
        "stockCount"
    ).textContent =
        stockCount;


    document.getElementById(
        "requestCount"
    ).textContent =
        requestCount;


    document.getElementById(
        "ratingCount"
    ).textContent =
        averageRating;
}


/* ================= STORAGE FUNCTIONS ================= */

function saveUsers() {

    localStorage.setItem(
        "tn_users",
        JSON.stringify(users)
    );
}


function saveCrops() {

    localStorage.setItem(
        "tn_crops",
        JSON.stringify(crops)
    );
}


function saveRequests() {

    localStorage.setItem(
        "tn_requests",
        JSON.stringify(requests)
    );
}


function saveFeedbacks() {

    localStorage.setItem(
        "tn_feedbacks",
        JSON.stringify(feedbacks)
    );
}


/* ================= TOAST ================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.style.display =
        "block";


    setTimeout(
        () => {

            toast.style.display =
                "none";

        },
        3000
    );
}