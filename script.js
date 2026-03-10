const uploadArea = document.querySelector(".upload-area");
const fileInput = document.querySelector("#file");
const browseBtn = document.querySelector(".btn");
const preview = document.querySelector("#preview");

browseBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    showPreview(file);
});

uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("active");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("active");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("active");
    const file = e.dataTransfer.files[0];
    showPreview(file);
});

function showPreview(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        preview.src = reader.result;
        console.log("TODO: Implement background removal");
    };
}
