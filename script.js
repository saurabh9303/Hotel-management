// script.js
const bookingForm = document.getElementById("bookingForm");
const notification = document.getElementById("notification");
const bookingList = document.getElementById("bookingList");
const modal = document.getElementById("bookingModal");
const closeBtn = document.querySelector(".close");
const bookingLink = document.getElementById("bookingLink");

const roomTypeSelect = document.getElementById("roomType");
const roomNumberContainer = document.getElementById("roomNumberContainer");
const roomNumberSelect = document.getElementById("roomNumber");
const paymentStatus = document.getElementById("paymentStatus");
const amountContainer = document.getElementById("amountContainer");
const amountPaidInput = document.getElementById("amountPaid");

let bookings = [];

const roomInventory = {
  "Standard Room": Array.from({ length: 10 }, (_, i) => 201 + i),
  "Deluxe Room": Array.from({ length: 10 }, (_, i) => 301 + i),
  "Executive Suite": Array.from({ length: 10 }, (_, i) => 401 + i),
};

roomTypeSelect.addEventListener("change", function () {
  const selectedRoomType = this.value;
  roomNumberSelect.innerHTML = "";
  if (selectedRoomType && roomInventory[selectedRoomType] && roomInventory[selectedRoomType].length > 0) {
    roomNumberContainer.style.display = "block";
    roomInventory[selectedRoomType].forEach(number => {
      const option = document.createElement("option");
      option.value = number;
      option.textContent = number;
      roomNumberSelect.appendChild(option);
    });
  } else {
    roomNumberContainer.style.display = "none";
    roomNumberSelect.innerHTML = "";
  }
});

paymentStatus.addEventListener("change", function () {
  if (this.value === "Not Paid") {
    amountContainer.style.display = "none";
    amountPaidInput.removeAttribute("required");
    amountPaidInput.value = "";
  } else {
    amountContainer.style.display = "block";
    amountPaidInput.setAttribute("required", "required");
  }
});

bookingForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const room = roomTypeSelect.value;
  const roomNumber = parseInt(roomNumberSelect.value);
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const status = paymentStatus.value;
  const amount = amountPaidInput.value ? parseFloat(amountPaidInput.value) : 0;

  if (new Date(checkout) <= new Date(checkin)) {
    alert("Checkout date must be after check-in date.");
    return;
  }

  const index = roomInventory[room].indexOf(roomNumber);
  if (index === -1) {
    alert("Selected room number is no longer available.");
    return;
  }
  roomInventory[room].splice(index, 1);

  bookings.push({ name, email, room, checkin, checkout, status, amount, roomNumber });

  bookingForm.reset();
  roomNumberContainer.style.display = "none";
  roomNumberSelect.innerHTML = "";
  amountContainer.style.display = "block";

  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 2500);
});

bookingLink.addEventListener("click", function (e) {
  e.preventDefault();
  bookingList.innerHTML = "";

  const today = new Date().setHours(0, 0, 0, 0);

  const activeBookings = bookings.filter(b => new Date(b.checkout).setHours(0, 0, 0, 0) >= today);
  const pastBookings = bookings.filter(b => new Date(b.checkout).setHours(0, 0, 0, 0) < today);

  renderBookingSection("🟢 Active Bookings", activeBookings);
  renderBookingSection("🔴 Completed Bookings", pastBookings);

  modal.style.display = "block";
});

function renderBookingSection(title, data) {
  const section = document.createElement("div");
  section.innerHTML = `<h4 style="margin: 15px 0;">${title}</h4>`;

  if (data.length === 0) {
    section.innerHTML += "<p>No bookings in this section.</p>";
  } else {
    data.forEach((b, index) => {
      const card = document.createElement("div");
      card.className = "booking-card";
      card.innerHTML = `
        <h4>Booking #${index + 1}</h4>
        <p><span>Guest:</span> ${b.name}</p>
        <p><span>Email:</span> ${b.email}</p>
        <p><span>Room Type:</span> ${b.room}</p>
        <p><span>Room No:</span> ${b.roomNumber}</p>
        <p><span>Check-in:</span> ${b.checkin}</p>
        <p><span>Check-out:</span> ${b.checkout}</p>
        <p><span>Payment Status:</span> ${b.status}</p>
        <p><span>Amount Paid:</span> ₹${b.amount.toFixed(2)}</p>
        <button class="deleteBtn">Delete</button>
      `;

      card.querySelector(".deleteBtn").addEventListener("click", () => {
        bookings = bookings.filter(book => book !== b);
        roomInventory[b.room].push(b.roomNumber);
        card.remove();
      });

      section.appendChild(card);
    });
  }

  bookingList.appendChild(section);
}

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = event => {
  if (event.target === modal) modal.style.display = "none";
};
