const canvas = document.getElementById("ladyCanvas");
const ctx = canvas.getContext("2d");
const saveBtn = document.getElementById("savePdfBtn");
const clearBtn = document.getElementById("clearBtn");
const signArea = document.getElementById("signArea");
const pdfNotice = document.getElementById("pdfNotice");

let drawing = false;

// --- Adjust canvas for device pixel ratio ---
function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Drawing Logic ---
function startDraw(e) {
  drawing = true;
  draw(e);
}
function endDraw() {
  drawing = false;
  ctx.beginPath();
}
function draw(e) {
  if (!drawing) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchend", endDraw);
canvas.addEventListener("touchmove", draw);

clearBtn.addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

// --- Save PDF ---
saveBtn.addEventListener("click", async () => {
  const signatureImg = canvas.toDataURL("image/png");
  signArea.style.display = "none";

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "pt", "a4");

  // Capture the agreement content
  const page = document.getElementById("agreementPage");
  const agreementCanvas = await html2canvas(page, { scale: 2 });
  const agreementImg = agreementCanvas.toDataURL("image/png");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (agreementCanvas.height * pdfWidth) / agreementCanvas.width;

  // Add agreement background
  pdf.addImage(agreementImg, "PNG", 0, 0, pdfWidth, pdfHeight);

  // --- Center signature 100px above bottom ---
  const signatureWidth = 160;
  const signatureHeight = 60;
  const xPosition = (pdfWidth - signatureWidth) / 2; // center horizontally
  const yPosition = pdfHeight - 100; // 100px from bottom

  pdf.addImage(signatureImg, "PNG", xPosition, yPosition, signatureWidth, signatureHeight);

  // Save the final signed PDF
  pdf.save("Agreement_of_Understanding_Lady_Signed.pdf");

  // Lock signing area
  localStorage.setItem("ladySigned", "true");
  signArea.classList.add("hidden");
  pdfNotice.classList.remove("hidden");
  signArea.style.display = "block";
});

// --- Reset ---
const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset Agreement";
resetBtn.style.background = "#b94e48";
resetBtn.style.color = "white";
resetBtn.style.marginTop = "15px";
resetBtn.style.fontWeight = "bold";
resetBtn.onclick = () => {
  if (confirm("Are you sure you want to reset and clear your saved signature?")) {
    localStorage.removeItem("ladySigned");
    location.reload();
  }
};
pdfNotice.appendChild(resetBtn);

// --- Lock on reload ---
window.onload = () => {
  if (localStorage.getItem("ladySigned") === "true") {
    signArea.classList.add("hidden");
    pdfNotice.classList.remove("hidden");
  }
};
