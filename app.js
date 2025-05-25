<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Tas - PDF Generator</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#1f2937">
    <meta name="mobile-web-app-capable" content="yes">
    <!-- <meta name="apple-mobile-web-app-capable" content="yes"> -->
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Order Tas">
    <link rel="manifest" href="/manifest.json">

    <!-- PWA Icons -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="apple-touch-icon" href="/icon-192.png">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- jsPDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .color-row { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .btn-primary { transition: all 0.2s ease; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
        .input-field { transition: all 0.2s ease; }
        .input-field:focus { transform: translateY(-1px); }
        @media print { .no-print { display: none !important; } }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-4 py-4">
            <div class="flex items-center space-x-3">
                <div class="bg-gray-800 p-2 rounded-lg">
                    <i class="fas fa-shopping-bag text-white text-lg"></i>
                </div>
                <div>
                    <h1 class="text-xl font-semibold text-gray-900">Order Management</h1>
                    <p class="text-sm text-gray-500">Generator PDF untuk orderan tas</p>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- Form Header -->
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900 flex items-center">
                    <i class="fas fa-edit text-gray-600 mr-2"></i>
                    Form Order Baru
                </h2>
            </div>

            <!-- Form Content -->
            <div class="p-6 space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-calendar-alt text-gray-400 mr-1"></i>
                            Tanggal Deadline
                        </label>
                        <input type="date" id="deadline" 
                               class="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-tag text-gray-400 mr-1"></i>
                            Nama Tas
                        </label>
                        <input type="text" id="namaTas" placeholder="Masukkan nama tas" 
                               class="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    </div>
                </div>

                <!-- Colors Section -->
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <label class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-palette text-gray-400 mr-1"></i>
                            Warna & Jumlah
                        </label>
                        <button type="button" id="addColor" 
                                class="btn-primary bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                            <i class="fas fa-plus text-sm"></i>
                            <span>Tambah Warna</span>
                        </button>
                    </div>
                    <div id="colorContainer" class="space-y-3">
                        <!-- Initial color row -->
                        <div class="color-row flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
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
                        </div>
                    </div>
                </div>

                <!-- Image Upload -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-image text-gray-400 mr-1"></i>
                        Upload Gambar Tas
                    </label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input type="file" id="imageUpload" accept="image/*" class="hidden">
                        <label for="imageUpload" class="cursor-pointer">
                            <div class="mb-2">
                                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                            </div>
                            <p class="text-gray-600">Klik untuk upload gambar</p>
                            <p class="text-xs text-gray-500 mt-1">PNG, JPG hingga 10MB</p>
                        </label>
                    </div>
                    <div id="imagePreview" class="mt-4 hidden">
                        <img id="previewImg" class="max-w-xs mx-auto rounded-lg shadow-md">
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button type="button" id="generatePDF" 
                            class="btn-primary flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2">
                        <i class="fas fa-file-pdf"></i>
                        <span>Generate PDF</span>
                    </button>
                    <!-- <button type="button" id="downloadPDF" 
                            class="btn-primary flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled>
                        <i class="fas fa-download"></i>
                        <span>Download PDF</span>
                    </button> -->
                </div>
            </div>
        </div>

        <!-- PDF Preview -->
        <div id="pdfPreview" class="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hidden">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                    <i class="fas fa-eye text-gray-600 mr-2"></i>
                    Preview PDF
                </h3>
                <div class="flex space-x-2">
                    <button id="printPDF" disabled 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center">
                        <i class="fas fa-print mr-2"></i>
                        Print
                    </button>
                    <button id="downloadPDF" disabled 
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center">
                        <i class="fas fa-download mr-2"></i>
                        Download
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div id="pdfContent" class="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
                    <!-- PDF content will be inserted here -->
                </div>
            </div>
        </div>
    </main>

    <!-- Success Modal -->
    <div id="successModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-check-circle text-green-500 text-4xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">PDF Berhasil Dibuat!</h3>
                <p class="text-gray-600 mb-4">PDF orderan siap untuk di print dan didownload</p>
                <button type="button" id="closeModal" 
                        class="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700">
                    Tutup
                </button>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="app.js"></script>
</body>
</html>
