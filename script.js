const DISPLAY_SIZE = 500;
const SCALE = 3;

document.querySelectorAll(".frame-box").forEach(box => {

    const canvas = box.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const upload = box.querySelector("input[type=file]");
    const downloadBtn = box.querySelector(".download");
    const frameSrc = box.dataset.frame;

    canvas.width = DISPLAY_SIZE * SCALE;
    canvas.height = DISPLAY_SIZE * SCALE;
    canvas.style.width = DISPLAY_SIZE + "px";
    canvas.style.height = DISPLAY_SIZE + "px";

    let userImg = new Image();
    let frameImg = new Image();
    frameImg.src = frameSrc;

    let imgX = 0, imgY = 0, imgScale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialDistance = 0;
    let initialScale = 1;

    function draw() {
        if (!userImg.complete || !frameImg.complete) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const ratio = Math.min(
            canvas.width / userImg.width,
            canvas.height / userImg.height
        );

        const w = userImg.width * ratio * imgScale;
        const h = userImg.height * ratio * imgScale;

        ctx.drawImage(
            userImg,
            imgX + (canvas.width - w) / 2,
            imgY + (canvas.height - h) / 2,
            w,
            h
        );

        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    }

    upload.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            userImg.onload = draw;
            userImg.src = reader.result;
            downloadBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    });

    downloadBtn.addEventListener("click", () => {
        draw();
        canvas.toBlob(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "mobadra-frame.png";
            a.click();
            URL.revokeObjectURL(a.href);
        }, "image/png", 1);
    });

    canvas.addEventListener("mousedown", e => {
        isDragging = true;
        startX = e.offsetX * SCALE - imgX;
        startY = e.offsetY * SCALE - imgY;
    });

    canvas.addEventListener("mousemove", e => {
        if (!isDragging) return;
        imgX = e.offsetX * SCALE - startX;
        imgY = e.offsetY * SCALE - startY;
        draw();
    });

    canvas.addEventListener("mouseup", () => isDragging = false);
    canvas.addEventListener("mouseleave", () => isDragging = false);

    canvas.addEventListener("wheel", e => {
        e.preventDefault();
        imgScale += e.deltaY * -0.001;
        imgScale = Math.min(Math.max(0.2, imgScale), 5);
        draw();
    });

    canvas.addEventListener("touchstart", e => {
        const rect = canvas.getBoundingClientRect();
        if (e.touches.length === 1) {
            isDragging = true;
            startX = (e.touches[0].clientX - rect.left) * SCALE - imgX;
            startY = (e.touches[0].clientY - rect.top) * SCALE - imgY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = imgScale;
        }
    });

    canvas.addEventListener("touchmove", e => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();

        if (e.touches.length === 1 && isDragging) {
            imgX = (e.touches[0].clientX - rect.left) * SCALE - startX;
            imgY = (e.touches[0].clientY - rect.top) * SCALE - startY;
            draw();
        } else if (e.touches.length === 2) {
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            imgScale = initialScale * (currentDistance / initialDistance);
            draw();
        }
    });

    canvas.addEventListener("touchend", () => isDragging = false);

    frameImg.onload = draw;
});