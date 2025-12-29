// ==========================================
// ==           KONFIGURASI USER           ==
// ==========================================
const users = [
    { user: "wawan", pass: "456", role: "admin", name: "Wawan (Admin)" },
    { user: "satrio", pass: "456", role: "karyawan", name: "Satrio" },
    { user: "bagus", pass: "456", role: "karyawan", name: "Bagus" }
];

// Variabel Global
let currentUser = null;
let reportsDB = []; // Database sementara (hilang jika refresh)
let itemCount = 0;
let resumeCount = 0;

// ==========================================
// ==           LOGIKA NAVIGASI            ==
// ==========================================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    if (pageId === 'page-view-reports') {
        renderAdminReports();
    }
}

function logout() { 
    currentUser = null; 
    document.getElementById('login-form').reset(); 
    showPage('page-login'); 
}

// ==========================================
// ==            LOGIKA LOGIN              ==
// ==========================================
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const u = document.getElementById('username').value.toLowerCase();
    const p = document.getElementById('password').value;
    
    const found = users.find(x => x.user === u && x.pass === p);
    
    if (found) {
        currentUser = found;
        document.getElementById('error-message').style.display = 'none';
        
        if (found.role === 'admin') {
            document.getElementById('admin-name-display').innerText = found.name;
            showPage('page-dashboard');
        } else {
            document.getElementById('user-name-display').innerText = found.name;
            document.getElementById('report-form').reset();
            document.getElementById('tanggal-laporan').valueAsDate = new Date();
            showPage('page-laporan');
        }
    } else { 
        document.getElementById('error-message').style.display = 'block'; 
    }
});

// ==========================================
// ==       LOGIKA LAPORAN KERJA           ==
// ==========================================

// Submit Laporan
document.getElementById('report-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tgl = document.getElementById('tanggal-laporan').value;
    const cat = document.getElementById('catatan').value;
    const fileInput = document.getElementById('foto-laporan');
    
    let imgURL = "https://via.placeholder.com/400x200?text=No+Image";
    if(fileInput.files && fileInput.files[0]){
        imgURL = URL.createObjectURL(fileInput.files[0]);
    }

    const newReport = {
        id: Date.now(),
        date: tgl,
        note: cat,
        image: imgURL,
        user: currentUser.name,
        username: currentUser.user,
        adminComment: "Belum ada komentar admin."
    };

    reportsDB.push(newReport);
    alert("Laporan Berhasil Disimpan!");
    e.target.reset();
    document.getElementById('tanggal-laporan').valueAsDate = new Date();
});

// Render Riwayat Employee
function renderEmployeeHistory() {
    const container = document.getElementById('employee-history-list');
    container.innerHTML = '';

    const myReports = reportsDB.filter(r => r.username === currentUser.user);
    myReports.sort((a, b) => b.id - a.id);

    if (myReports.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #777;">Belum ada riwayat laporan yang Anda kirim.</p>';
    } else {
        myReports.forEach(r => {
            const html = `
                <div class="report-card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span style="font-weight:bold; color:var(--primary-color);">${r.date}</span>
                        <span style="font-size:0.8em; color:#666;">ID: ${r.id}</span>
                    </div>
                    <p style="margin-bottom:10px;">${r.note}</p>
                    <img src="${r.image}" alt="Bukti Foto">
                    <div class="admin-comment-display">
                        <strong>Tanggapan Admin:</strong><br>
                        ${r.adminComment}
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });
    }
    showPage('page-employee-history');
}

// Render Laporan Masuk (Admin)
function renderAdminReports() {
    const container = document.getElementById('report-list-container');
    container.innerHTML = '';

    const allReports = [...reportsDB].sort((a, b) => b.id - a.id);

    if (allReports.length === 0) {
        container.innerHTML = '<p id="no-reports-message" style="text-align: center; color: #777;">Belum ada laporan masuk.</p>';
    } else {
        allReports.forEach(r => {
            const html = `
                <div class="report-card" style="border-left: 5px solid var(--primary-color);">
                    <h4 style="text-align:left; margin:0;">Oleh: ${r.user}</h4>
                    <small style="color:#555;">Tanggal: ${r.date}</small>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
                    <p>${r.note}</p>
                    <img src="${r.image}" style="max-height: 200px; object-fit: cover;">
                    <div style="margin-top:10px;">
                        <label style="font-weight:bold; font-size:0.9em;">Berikan Komentar:</label>
                        <div style="display:flex; gap:5px;">
                            <input type="text" id="comment-${r.id}" class="form-input" placeholder="Tulis tanggapan..." value="${r.adminComment !== 'Belum ada komentar admin.' ? r.adminComment : ''}">
                            <button class="btn btn-primary" style="width:auto; margin:0;" onclick="saveComment(${r.id})">Kirim</button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });
    }
}

function saveComment(id) {
    const val = document.getElementById(`comment-${id}`).value;
    const reportIndex = reportsDB.findIndex(r => r.id === id);
    if (reportIndex !== -1) {
        reportsDB[reportIndex].adminComment = val;
        alert("Komentar tersimpan!");
    }
}


// ==========================================
// ==           LOGIKA INVOICE             ==
// ==========================================

document.getElementById('inv-date').valueAsDate = new Date();
addItem(); 
addResumeItem();

function addItem() {
    itemCount++;
    const div = document.createElement('div');
    div.className = 'item-block';
    div.innerHTML = `
        <div style="display:flex; justify-content: space-between;">
            <h4 style="margin:0;">Item ${itemCount}</h4>
            <small style="color:red; cursor:pointer" onclick="this.parentElement.parentElement.remove(); calcTotal()">Hapus</small>
        </div>
        <div class="form-group"><input type="text" class="form-input i-desc" placeholder="Uraian (cth: Kabel)"></div>
        <div style="display:flex; gap:5px">
            <div style="flex:1"><input type="date" class="form-input i-date"></div>
            <div style="flex:1"><input type="number" class="form-input i-qty" placeholder="Qty" oninput="calcTotal()"></div>
            <div style="flex:1"><input type="text" class="form-input i-unit" placeholder="Satuan"></div>
        </div>
        <div style="display:flex; gap:5px; margin-top:5px;">
            <div class="price-wrapper" style="flex:2"><span class="price-prefix">Rp</span><input type="number" class="form-input price-input i-price" placeholder="Harga" oninput="calcTotal()"></div>
            <div style="flex:2"><input type="text" class="form-input i-note" placeholder="Keterangan"></div>
        </div>
    `;
    document.getElementById('items-container').appendChild(div);
}

function addResumeItem() {
    resumeCount++;
    const div = document.createElement('div');
    div.className = 'resume-block';
    div.innerHTML = `
        <div style="display:flex; justify-content: space-between;">
            <h4 style="margin:0;">Resume ${resumeCount}</h4>
            <small style="color:red; cursor:pointer" onclick="this.parentElement.parentElement.remove(); calcTotal()">Hapus</small>
        </div>
        <div class="form-group"><input type="text" class="form-input r-desc" placeholder="Jenis Pengeluaran (cth: Sparepart)"></div>
        <div style="display:flex; gap:5px; margin-top:5px;">
            <div class="price-wrapper" style="flex:1"><span class="price-prefix">Rp</span><input type="number" class="form-input price-input r-amount" placeholder="Jumlah" oninput="calcTotal()"></div>
            <div style="flex:2"><input type="text" class="form-input r-note" placeholder="Keterangan"></div>
        </div>
    `;
    document.getElementById('resume-container').appendChild(div);
}

function formatRp(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

function calcTotal() {
    let totalPengeluaran = 0;
    document.querySelectorAll('.item-block').forEach(el => {
        const q = el.querySelector('.i-qty').value || 0;
        const p = el.querySelector('.i-price').value || 0;
        totalPengeluaran += (q * p);
    });
    const deposit = document.getElementById('inv-dp').value || 0;
    const kekurangan = deposit - totalPengeluaran;

    document.getElementById('grand-total-pengeluaran').innerText = formatRp(totalPengeluaran);
    document.getElementById('grand-total-rencana').innerText = formatRp(deposit);
    const elKekurangan = document.getElementById('grand-total-kekurangan');
    if(kekurangan < 0) {
        elKekurangan.innerText = `(${formatRp(Math.abs(kekurangan))})`;
        elKekurangan.style.color = 'red';
    } else {
        elKekurangan.innerText = formatRp(kekurangan);
        elKekurangan.style.color = 'green';
    }
    return { totalPengeluaran, deposit, kekurangan };
}

function syncDataToPrintLayout() {
    const rawDate = document.getElementById('inv-date').value;
    const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';
    
    document.getElementById('print-date').innerText = formattedDate;
    document.getElementById('print-customer').innerText = document.getElementById('inv-customer').value || "-";
    document.getElementById('print-project').innerText = document.getElementById('inv-project').value || "-";
    document.getElementById('print-lokasi').innerText = document.getElementById('inv-lokasi').value || "-";
    
    const garansiSvc = document.getElementById('inv-garansi-service').value;
    document.getElementById('print-garansi-service-table').innerText = garansiSvc;
    document.getElementById('print-garansi-service-resume').innerText = garansiSvc;
    document.getElementById('print-sign-customer').innerText = document.getElementById('inv-customer').value || "........................";

    const tbodyDetail = document.getElementById('print-tbody-detail');
    tbodyDetail.innerHTML = '';
    let idx = 1;
    document.querySelectorAll('.item-block').forEach(el => {
        const desc = el.querySelector('.i-desc').value;
        const rawItemDate = el.querySelector('.i-date').value;
        const dateStr = rawItemDate ? new Date(rawItemDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';
        const qty = el.querySelector('.i-qty').value || 0;
        const unit = el.querySelector('.i-unit').value || '';
        const price = el.querySelector('.i-price').value || 0;
        const note = el.querySelector('.i-note').value || '';
        const sum = qty * price;
        
        if(desc) {
            tbodyDetail.innerHTML += `<tr>
                <td class="col-no">${idx++}</td>
                <td class="col-tgl">${dateStr}</td>
                <td>${desc}</td>
                <td class="col-rp">${formatRp(price)}</td>
                <td class="col-qty">${qty} ${unit}</td>
                <td class="col-rp">${formatRp(sum)}</td>
                <td>${note}</td>
            </tr>`;
        }
    });

    const tbodyResume = document.getElementById('print-tbody-resume');
    tbodyResume.innerHTML = '';
    let ridx = 1;
    let totalResume = 0;
    document.querySelectorAll('.resume-block').forEach(el => {
        const desc = el.querySelector('.r-desc').value;
        const amount = Number(el.querySelector('.r-amount').value) || 0;
        const note = el.querySelector('.r-note').value || '';
        totalResume += amount;
        
        if(desc) {
            tbodyResume.innerHTML += `<tr>
                <td class="col-no">${ridx++}</td>
                <td>${desc}</td>
                <td class="col-rp">${formatRp(amount)}</td>
                <td>${note}</td>
            </tr>`;
        }
    });

    const totals = calcTotal();
    document.getElementById('print-sum-pengeluaran').innerText = formatRp(totals.totalPengeluaran);
    document.getElementById('print-sum-resume').innerText = formatRp(totalResume);
    document.getElementById('print-val-rencana').innerText = formatRp(totals.deposit);

    const elValKekurangan = document.getElementById('print-val-kekurangan');
    if(totals.kekurangan < 0) {
        elValKekurangan.innerText = `(${formatRp(Math.abs(totals.kekurangan))})`;
    } else {
        elValKekurangan.innerText = formatRp(totals.kekurangan);
    }
}

function printInvoice() { syncDataToPrintLayout(); window.print(); }

async function downloadPDF() {
    try {
        syncDataToPrintLayout();
        const element = document.querySelector('.invoice-container');
        const printContainer = document.getElementById('print-container');
        
        printContainer.style.left = '0';
        printContainer.style.top = '0';
        printContainer.style.zIndex = '1000'; 
        
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        
        printContainer.style.left = '-9999px';
        printContainer.style.zIndex = '-1';

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Invoice-Kenzie.pdf');

    } catch (error) {
        alert("Terjadi kesalahan saat download PDF: " + error.message);
    }
}