// Global variables
let uploadedImage = null;
let generatedPDF = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
    }

    // PWA Install Prompt (optional)
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button (if you have one)
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'block';
        
        installBtn.addEventListener('click', () => {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            } else {
            console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
        });
    }
    });

    // Set default deadline to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('deadline').value = tomorrow.toISOString().split('T')[0];

    // Bind event listeners
    bindEvents();

    // Tambahkan di fungsi initializeApp()
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('color-name') && 
            !e.target.classList.contains('color-qty')) {
            // Jika klik di luar input warna/jumlah, hilangkan fokus
            if (document.activeElement.classList.contains('color-name') || 
                document.activeElement.classList.contains('color-qty')) {
                document.activeElement.blur();
            }
        }
    });

}

// Jika perlu membersihkan event listener
function cleanup() {
    document.removeEventListener('keydown', handleColorInputEnter);
}

function bindEvents() {
    // Add color button
    document.getElementById('addColor').addEventListener('click', addColorRow);
    
    // Image upload
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    
    // PDF buttons
    document.getElementById('generatePDF').addEventListener('click', generatePDF);
    document.getElementById('downloadPDF').addEventListener('click', downloadPDF);
    document.getElementById('printPDF').addEventListener('click', printPDF);
    
    // Modal close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Initial remove color button
    bindRemoveColorButtons();

    // Add Enter key behavior for color inputs
    document.addEventListener('keydown', handleColorInputEnter);
}

// Tambahkan fungsi baru untuk menangani Enter
function handleColorInputEnter(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        
        // Jika Enter ditekan di input nama warna
        if (activeElement.classList.contains('color-name')) {
            e.preventDefault();
            const qtyInput = activeElement.closest('.color-row').querySelector('.color-qty');
            qtyInput.focus();
        } 
        // Jika Enter ditekan di input jumlah
        else if (activeElement.classList.contains('color-qty')) {
            e.preventDefault();
            // Cek jika input jumlah memiliki nilai
            if (activeElement.value) {
                addColorRow();
                const newRow = document.querySelector('.color-row:last-child');
                const newNameInput = newRow.querySelector('.color-name');
                newNameInput.focus();
            }
        }
    }
}


function addColorRow() {
    const container = document.getElementById('colorContainer');
    const colorRow = document.createElement('div');
    colorRow.className = 'color-row flex items-center space-x-3 p-4 bg-gray-50 rounded-lg';
    colorRow.innerHTML = `
        <div class="flex-1">
            <input type="text" placeholder="Nama warna" 
                   class="color-name w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent">
        </div>
        <div class="w-32">
            <input type="number" placeholder="Jumlah" min="1" 
                   class="color-qty w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent">
        </div>
        <button type="button" class="remove-color text-red-500 hover:text-red-700 p-2">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(colorRow);
    bindRemoveColorButtons();
    
    // Fokus ke input nama warna di row baru
    const nameInput = colorRow.querySelector('.color-name');
    nameInput.focus();
}

function bindRemoveColorButtons() {
    document.querySelectorAll('.remove-color').forEach(btn => {
        btn.addEventListener('click', function() {
            if (document.querySelectorAll('.color-row').length > 1) {
                this.closest('.color-row').remove();
            } else {
                alert('Minimal harus ada 1 warna');
            }
        });
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('File terlalu besar. Maksimal 10MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Process image to fix orientation and create thumbnail
            processImageForPDF(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function processImageForPDF(imageSrc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Set canvas size to square thumbnail
        const size = 300; // Higher resolution for better quality
        canvas.width = size;
        canvas.height = size;
        
        // Calculate dimensions to fit image in square while maintaining aspect ratio
        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
        
        if (img.width > img.height) {
            // Landscape - crop from center horizontally
            sourceX = (img.width - img.height) / 2;
            sourceWidth = img.height;
        } else if (img.height > img.width) {
            // Portrait - crop from center vertically
            sourceY = (img.height - img.width) / 2;
            sourceHeight = img.width;
        }
        
        // Fill with white background first
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Draw image centered and cropped to square
        ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight, // source
            0, 0, size, size // destination
        );
        
        // Convert back to data URL with high quality
        uploadedImage = canvas.toDataURL('image/jpeg', 0.9);
        
        // Update preview
        document.getElementById('imagePreview').classList.remove('hidden');
        document.getElementById('previewImg').src = uploadedImage;
    };
    
    img.onerror = function() {
        alert('Gagal memproses gambar. Silakan coba gambar lain.');
    };
    
    img.src = imageSrc;
}

function validateForm() {
    const deadline = document.getElementById('deadline').value;
    const namaTas = document.getElementById('namaTas').value.trim();
    const colorRows = document.querySelectorAll('.color-row');
    
    if (!deadline) {
        alert('Tanggal deadline harus diisi');
        return false;
    }
    
    if (!namaTas) {
        alert('Nama tas harus diisi');
        return false;
    }
    
    let hasValidColor = false;
    colorRows.forEach(row => {
        const colorName = row.querySelector('.color-name').value.trim();
        const colorQty = row.querySelector('.color-qty').value;
        if (colorName && colorQty && parseInt(colorQty) > 0) {
            hasValidColor = true;
        }
    });
    
    if (!hasValidColor) {
        alert('Minimal harus ada 1 warna dengan jumlah yang valid');
        return false;
    }
    
    return true;
}

function getFormData() {
    const deadline = document.getElementById('deadline').value;
    const namaTas = document.getElementById('namaTas').value.trim();
    const colorRows = document.querySelectorAll('.color-row');
    
    const colors = [];
    let totalQty = 0;
    
    colorRows.forEach(row => {
        const colorName = row.querySelector('.color-name').value.trim();
        const colorQty = parseInt(row.querySelector('.color-qty').value) || 0;
        
        if (colorName && colorQty > 0) {
            colors.push({ name: colorName, qty: colorQty });
            totalQty += colorQty;
        }
    });
    
    return {
        deadline: new Date(deadline).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        namaTas: namaTas,
        colors: colors,
        totalQty: totalQty,
        image: uploadedImage
    };
}

function generatePDFPreview(data) {
    const previewContent = document.getElementById('pdfContent');
    let colorsHTML = '';
    
    data.colors.forEach(color => {
        colorsHTML += `
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-700">${color.name}</span>
                <span class="font-medium">${color.qty} pcs</span>
            </div>
        `;
    });
    
    // Create thumbnail layout for preview
    const orderInfoHTML = data.image ? 
        `<div class="flex items-start gap-6 mb-6">
            <div class="flex-1">
                <div class="mb-4">
                    <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Nama Produk</h3>
                    <p class="text-lg font-semibold text-gray-900">${data.namaTas}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Deadline</h3>
                    <p class="text-lg font-semibold text-gray-900">${data.deadline}</p>
                </div>
            </div>
            <div class="flex-shrink-0">
                <img src="${data.image}" alt="Gambar Tas" class="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm">
            </div>
        </div>` : 
        `<div class="grid grid-cols-2 gap-6 mb-6">
            <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Nama Produk</h3>
                <p class="text-lg font-semibold text-gray-900">${data.namaTas}</p>
            </div>
            <div>
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Deadline</h3>
                <p class="text-lg font-semibold text-gray-900">${data.deadline}</p>
            </div>
        </div>`;
    
    previewContent.innerHTML = `
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">ORDER CONFIRMATION</h1>
            <div class="w-16 h-1 bg-gray-800 mx-auto"></div>
        </div>
        
        <!-- Order Info with Thumbnail -->
        <div class="mb-8">
            ${orderInfoHTML}
        </div>
        
        <!-- Colors Table -->
        <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Detail Warna & Jumlah</h3>
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-1">
                    ${colorsHTML}
                </div>
            </div>
        </div>
        
        <!-- Total -->
        <div class="mt-8 pt-6 border-t-2 border-gray-800">
            <div class="flex justify-between items-center">
                <span class="text-xl font-semibold text-gray-900">Total Tas:</span>
                <span class="text-2xl font-bold text-gray-900">${data.totalQty} pcs</span>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-gray-200 text-center">
            <p class="text-sm text-gray-500">Generated on ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
    `;
    
    document.getElementById('pdfPreview').classList.remove('hidden');
    document.getElementById('pdfPreview').scrollIntoView({ behavior: 'smooth' });
}

async function generatePDF() {
    if (!validateForm()) return;
    
    const data = getFormData();
    generatePDFPreview(data);
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Set font
        pdf.setFont('helvetica');
        
        let yPosition = 30;
        
        // Header
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ORDER CONFIRMATION', 105, yPosition, { align: 'center' });
        
        // Line under header
        pdf.setLineWidth(2);
        pdf.line(20, yPosition + 5, 190, yPosition + 5);
        
        yPosition += 25;
        
        // Order Info with thumbnail image
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        
        // Add thumbnail image first if exists (positioned on the right)
        let thumbnailAdded = false;
        if (data.image) {
            try {
                const thumbnailSize = 30; // Slightly smaller for better fit
                const thumbnailX = 155; // Adjusted position
                const thumbnailY = yPosition - 2;
                
                // Add image with proper format specification
                pdf.addImage(data.image, 'JPEG', thumbnailX, thumbnailY, thumbnailSize, thumbnailSize);
                thumbnailAdded = true;
            } catch (error) {
                console.warn('Could not add thumbnail to PDF:', error);
            }
        }
        
        // Product info (left side)
        pdf.text('NAMA PRODUK:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        // Limit text width if thumbnail is present
        const maxTextWidth = thumbnailAdded ? 120 : 170;
        const splitNama = pdf.splitTextToSize(data.namaTas, maxTextWidth - 50);
        pdf.text(splitNama, 70, yPosition);
        
        // Adjust yPosition based on text height
        const textHeight = splitNama.length * 5;
        yPosition += Math.max(10, textHeight);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('DEADLINE:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        const splitDeadline = pdf.splitTextToSize(data.deadline, maxTextWidth - 50);
        pdf.text(splitDeadline, 70, yPosition);
        
        // Ensure we move past the thumbnail area
        if (thumbnailAdded) {
            yPosition = Math.max(yPosition + 10, yPosition - 15 + 35 + 10);
        } else {
            yPosition += 15;
        }
        
        yPosition += 10;
        
        // Colors section
        pdf.setFont('helvetica', 'bold');
        pdf.text('DETAIL WARNA & JUMLAH:', 20, yPosition);
        yPosition += 10;
        
        pdf.setFont('helvetica', 'normal');
        data.colors.forEach(color => {
            pdf.text(`• ${color.name}`, 25, yPosition);
            pdf.text(`${color.qty} pcs`, 150, yPosition);
            yPosition += 8;
        });
        
        yPosition += 15;
        
        // Total
        pdf.setLineWidth(1);
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TOTAL TAS:', 20, yPosition);
        pdf.text(`${data.totalQty} pcs`, 150, yPosition);
        
        // Footer
        yPosition += 20;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on ${new Date().toLocaleDateString('id-ID')}`, 105, yPosition, { align: 'center' });
        
        generatedPDF = pdf;
        
        // Enable download and print buttons
        document.getElementById('downloadPDF').disabled = false;
        document.getElementById('printPDF').disabled = false;
        
        // Show success modal
        showSuccessModal();
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
    }
}

function downloadPDF() {
    if (generatedPDF) {
        const namaTas = document.getElementById('namaTas').value.trim() || 'Order';
        const fileName = `Order_${namaTas.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        generatedPDF.save(fileName);
    }
}

function printPDF() {
    if (generatedPDF) {
        // Create a blob from the PDF
        const pdfBlob = generatedPDF.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        // Open in new window for printing
        const printWindow = window.open(blobUrl);
        
        // Wait for PDF to load, then trigger print dialog
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                // Clean up the blob URL after printing
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 1000);
            }, 500);
        };
    }
}

function showSuccessModal() {
    document.getElementById('successModal').classList.remove('hidden');
    document.getElementById('successModal').classList.add('flex');
}

function closeModal() {
    document.getElementById('successModal').classList.add('hidden');
    document.getElementById('successModal').classList.remove('flex');
}

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    return allowedTypes.includes(file.type);
}

// PWA Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + Enter to generate PDF
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generatePDF();
    }
    
    // Ctrl + D to download PDF
    if (e.ctrlKey && e.key === 'd' && !document.getElementById('downloadPDF').disabled) {
        e.preventDefault();
        downloadPDF();
    }
    
    // Ctrl + P to print PDF
    if (e.ctrlKey && e.key === 'p' && !document.getElementById('printPDF').disabled) {
        e.preventDefault();
        printPDF();
    }
});

// Auto-save form data to prevent data loss
function autoSaveFormData() {
    const formData = {
        deadline: document.getElementById('deadline').value,
        namaTas: document.getElementById('namaTas').value,
        colors: []
    };
    
    document.querySelectorAll('.color-row').forEach(row => {
        const colorName = row.querySelector('.color-name').value;
        const colorQty = row.querySelector('.color-qty').value;
        if (colorName || colorQty) {
            formData.colors.push({ name: colorName, qty: colorQty });
        }
    });
    
    // Store in memory only (no localStorage for Claude.ai)
    window.tempFormData = formData;
}

// Auto-save every 30 seconds
setInterval(autoSaveFormData, 30000);

// Form change detection
document.addEventListener('input', () => {
    // Reset download and print buttons when form changes
    document.getElementById('downloadPDF').disabled = true;
    document.getElementById('printPDF').disabled = true;
    generatedPDF = null;
});

console.log('Order Tas App initialized successfully!');
