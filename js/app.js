/* ===================================
   Productivity Dashboard - Core Logic
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. THEME MANAGER (Light/Dark Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') document.body.classList.add('dark-mode');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    // --- 2. GREETING & CLOCK (Custom Name) ---
    const nameDisplay = document.getElementById('user-name');
    const savedName = localStorage.getItem('user-name') || 'Naufal';
    nameDisplay.innerText = savedName;

    // Simpan nama saat user selesai mengetik (blur)
    nameDisplay.addEventListener('blur', () => {
        localStorage.setItem('user-name', nameDisplay.innerText);
    });

    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        document.querySelector('.current-time').innerText = timeStr;
        document.querySelector('.current-date').innerText = dateStr;

        // Update Greeting Text based on time
        const hour = now.getHours();
        let greet = "Good night";
        if (hour >= 5 && hour < 12) greet = "Good morning";
        else if (hour >= 12 && hour < 17) greet = "Good afternoon";
        else if (hour >= 17 && hour < 21) greet = "Good evening";
        
        document.getElementById('greeting-text').innerText = greet;
    }
    setInterval(updateClock, 1000);
    updateClock();

  // --- 3. FOCUS TIMER (Bisa Custom) ---
    const timerDisplay = document.querySelector('.timer-display');
    const startBtn = document.querySelector('.btn-start');
    const stopBtn = document.querySelector('.btn-stop');
    const resetBtn = document.querySelector('.btn-reset');
    
    // Elemen baru untuk set waktu
    const setTimeBtn = document.getElementById('btn-set-time');
    const customMinutesInput = document.getElementById('custom-minutes');

    let timerInterval = null;
    let defaultTime = 25 * 60; // Default awal 25 menit (dalam detik)
    let timeLeft = defaultTime;

    // Fungsi update layar
    function updateTimerUI() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Tombol Start
    startBtn.addEventListener('click', () => {
        if (timerInterval) return; // Cegah double klik
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerUI();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                alert("Waktu habis! Silakan istirahat.");
            }
        }, 1000);
    });

    // Tombol Stop
    stopBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
    });

    // Tombol Reset
    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        timeLeft = defaultTime; // Kembali ke waktu yang terakhir di-set
        updateTimerUI();
    });

    setTimeBtn.addEventListener('click', () => {
        const newMinutes = parseInt(customMinutesInput.value);
        if (newMinutes > 0 && newMinutes <= 120) {
            clearInterval(timerInterval);
            timerInterval = null;
            defaultTime = newMinutes * 60; // Ubah default time
            timeLeft = defaultTime;
            updateTimerUI();
        } else {
            alert("Masukkan menit yang valid (1 - 120)!");
        }
    });
    updateTimerUI();
    // --- 4. TASK MANAGER (Prevent Duplicate) ---
    const taskInput = document.querySelector('.task-input');
    const addTaskBtn = document.querySelector('.btn-add-task');
    const taskListUl = document.querySelector('.task-list');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function renderTasks() {
        taskListUl.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <button onclick="deleteTask(${index})" class="btn-delete-task">X</button>
            `;
            // Toggle complete on click
            li.addEventListener('click', (e) => {
                if(e.target.tagName !== 'BUTTON') {
                    tasks[index].completed = !tasks[index].completed;
                    saveTasks();
                }
            });
            taskListUl.appendChild(li);
        });
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        if (!text) return;

        // FITUR PILIHAN: Prevent Duplicate
        const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
        if (isDuplicate) {
            alert("This task already exists!");
            return;
        }

        tasks.push({ text, completed: false });
        taskInput.value = '';
        saveTasks();
    });

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
    };

    renderTasks();
    // --- 5. QUICK LINKS MANAGER ---
    function renderTasks() {
        taskListUl.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            // --- KODE YANG DIUBAH MULAI DARI SINI ---
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </div>
                <button onclick="deleteTask(${index})" class="btn-delete-task">Delete</button>
            `;
            // --- KODE YANG DIUBAH SAMPAI SINI ---

            // Toggle complete on click
            li.querySelector('.task-checkbox').addEventListener('change', () => {
                tasks[index].completed = !tasks[index].completed;
                saveTasks();
            });
            taskListUl.appendChild(li);
        });
    }
    // Ambil data link dari Local Storage
    let quickLinks = JSON.parse(localStorage.getItem('quick-links')) || [];

    function renderLinks() {
        linksGrid.innerHTML = '';
        quickLinks.forEach((link, index) => {
            const linkCard = document.createElement('div');
            linkCard.className = 'link-item';
            linkCard.innerHTML = `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer">
                    <span class="link-name">${link.name}</span>
                </a>
                <button onclick="deleteLink(${index})" class="btn-delete-link" title="Hapus">×</button>
            `;
            linksGrid.appendChild(linkCard);
        });
    }

    function saveLinks() {
        localStorage.setItem('quick-links', JSON.stringify(quickLinks));
        renderLinks();
    }

    addLinkBtn.addEventListener('click', () => {
        const name = linkNameInput.value.trim();
        const url = linkUrlInput.value.trim();

        if (!name || !url) {
            alert("Isi nama dan URL link-nya dulu ya!");
            return;
        }

        // Pastikan URL valid (minimal ada http)
        if (!url.startsWith('http')) {
            alert("URL harus diawali dengan http:// atau https://");
            return;
        }

        quickLinks.push({ name, url });
        linkNameInput.value = '';
        linkUrlInput.value = '';
        saveLinks();
    });

    // Fungsi hapus link (dibuat global agar bisa diakses onclick)
    window.deleteLink = (index) => {
        quickLinks.splice(index, 1);
        saveLinks();
    };

    // Jalankan render pertama kali
    renderLinks();
});