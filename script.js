// ========================================
// Bloom Gateway - JavaScript (完全版)
// ========================================

let studentsData = [];
let filteredStudents = [];
let currentView = 'grid';

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 システム起動');
    loadStudentData();
});

// ========================================
// データ読み込み
// ========================================
async function loadStudentData() {
    try {
        console.log('📡 Googleスプレッドシートからデータ取得中...');
        
        const apiUrl = 'https://script.google.com/macros/s/AKfycbxoCqFq2-BSgaLH0OomtX7jGc5CwjH4-UQtfgnEM2fy7_oYfCQWFjaEwzXjNJu6ZrUN_w/exec';
        
        const response = await fetch(apiUrl);
        const googleData = await response.json();
        
        studentsData = googleData;
        filteredStudents = studentsData;
        
        console.log(`✅ ${studentsData.length}件のデータ読み込み完了(Googleスプレッドシート)`);
        console.log('📊 データ:', studentsData);
        
        displayStudents();
        updateStats();
        setupEventListeners();
        
        document.getElementById('loading').style.display = 'none';
        
    } catch (error) {
        console.error('❌ エラー:', error);
        document.getElementById('loading').innerHTML = '<p style="color: #ff006e;">データ読み込みエラー</p>';
    }
}
// ========================================
// イベントリスナー設定
// ========================================
function setupEventListeners() {
    // フィルター
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('interestFilter').addEventListener('change', applyFilters);
    document.getElementById('skillFilter').addEventListener('change', applyFilters);
    document.getElementById('searchBox').addEventListener('input', applyFilters);
    // リセット
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // 表示切り替え
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            displayStudents();
        });
    });
    
    // モーダル閉じる
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // モーダル背景クリックで閉じる
    const modal = document.getElementById('studentModal');
    modal.addEventListener('click', (e) => {
        // modal自体またはmodal-overlayをクリックした時
        if (e.target === modal || e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
    
    console.log('✅ イベントリスナー設定完了');
}

// ========================================
// フィルター適用
// ========================================
function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const interestFilter = document.getElementById('interestFilter').value;
    const skillFilter = document.getElementById('skillFilter').value;
    const searchQuery = document.getElementById('searchBox').value.toLowerCase();
    
    filteredStudents = studentsData.filter(student => {
        if (typeFilter && student.type !== typeFilter) return false;
        if (categoryFilter && student.category !== categoryFilter) return false;
        if (interestFilter && !student.interests.includes(interestFilter)) return false;
        if (skillFilter && !student.skills.includes(skillFilter)) return false;
        if (searchQuery) {
            const searchText = `${student.name} ${student.type} ${student.category} ${student.interests.join(' ')} ${student.skills.join(' ')}`.toLowerCase();
            if (!searchText.includes(searchQuery)) return false;
        }
        
        return true;
    });
    
    console.log(`🔍 フィルター結果: ${filteredStudents.length}件`);
    displayStudents();
    updateStats();
}

// ========================================
// フィルターリセット
// ========================================
function resetFilters() {
    document.getElementById('typeFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('interestFilter').value = '';
    document.getElementById('skillFilter').value = '';
    document.getElementById('searchBox').value = '';
    
    filteredStudents = studentsData;
    displayStudents();
    updateStats();
}

// ========================================
// 人材表示
// ========================================
function displayStudents() {
    const container = document.getElementById('studentsGrid');
    const noData = document.getElementById('noData');
    
    if (filteredStudents.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    if (currentView === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }
    
    container.innerHTML = filteredStudents.map(student => createStudentCard(student)).join('');
    
    // カードクリックイベント
    container.querySelectorAll('.student-card').forEach((card, index) => {
        card.addEventListener('click', () => showStudentDetail(filteredStudents[index]));
    });
}

// ========================================
// カード生成
// ========================================
function createStudentCard(student) {
    const matchScore = calculateMatchScore(student);
    
    const subtitle = student.type === '学生' 
        ? `${student.university} / ${student.grade}` 
        : `${student.company} / ${student.experience}`;
    
    return `
        <div class="student-card" data-id="${student.id}">
            <div class="card-header">
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <div class="student-meta">${subtitle}</div>
                </div>
                <div class="match-score">${matchScore}%</div>
            </div>
            
            <div class="card-tags">
                <span class="tag" style="background: rgba(255, 190, 11, 0.2); border-color: var(--color-accent); color: var(--color-accent);">${student.category}</span>
                ${student.interests.slice(0, 2).map(interest => `<span class="tag">${interest}</span>`).join('')}
                ${student.skills.slice(0, 2).map(skill => `<span class="tag skill">${skill}</span>`).join('')}
            </div>
            
            <div class="card-sns">
                ${student.sns.instagram ? `<a href="${student.sns.instagram}" target="_blank" class="sns-link" onclick="event.stopPropagation()">📷 Instagram</a>` : ''}
                ${student.sns.tiktok ? `<a href="${student.sns.tiktok}" target="_blank" class="sns-link" onclick="event.stopPropagation()">🎵 TikTok</a>` : ''}
                ${student.sns.twitter ? `<a href="${student.sns.twitter}" target="_blank" class="sns-link" onclick="event.stopPropagation()">🐦 X</a>` : ''}
            </div>
        </div>
    `;
}

// ========================================
// マッチングスコア計算
// ========================================
function calculateMatchScore(student) {
    let score = 50;
    score += student.interests.length * 5;
    score += student.skills.length * 8;
    
    const snsCount = Object.values(student.sns).filter(Boolean).length;
    score += snsCount * 5;
    
    return Math.min(Math.round(score), 100);
}

// ========================================
// 詳細モーダル表示
// ========================================
function showStudentDetail(student) {
    const modal = document.getElementById('studentModal');
    const modalBody = document.getElementById('modalBody');
    const matchScore = calculateMatchScore(student);
    
    const subtitle = student.type === '学生' 
        ? `${student.university} / ${student.grade}` 
        : `${student.company} / ${student.experience}`;
    
    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">👤</div>
            <h2 style="font-family: var(--font-display); font-size: 2rem; color: var(--color-primary); margin-bottom: 0.5rem;">${student.name}</h2>
            <p style="color: var(--color-text-dim); font-size: 1.1rem;">${subtitle}</p>
            <span style="display: inline-block; background: rgba(255, 190, 11, 0.2); border: 1px solid var(--color-accent); color: var(--color-accent); padding: 0.3rem 0.8rem; border-radius: 20px; margin: 0.5rem; font-size: 0.9rem;">${student.category}</span>
            <div style="display: inline-block; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: 700;">
                マッチング度: ${matchScore}%
            </div>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">📧 連絡先</h3>
            <p style="color: var(--color-text); margin-bottom: 0.5rem;"><strong>メール:</strong> ${student.email}</p>
            <p style="color: var(--color-text);"><strong>電話:</strong> ${student.phone}</p>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">🎯 興味分野</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${student.interests.map(interest => `<span class="tag">${interest}</span>`).join('')}
            </div>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">💪 スキル</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${student.skills.map(skill => `<span class="tag skill">${skill}</span>`).join('')}
            </div>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">📱 SNS</h3>
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                ${student.sns.instagram ? `<a href="${student.sns.instagram}" target="_blank" class="sns-link" style="width: fit-content;">📷 Instagram</a>` : ''}
                ${student.sns.tiktok ? `<a href="${student.sns.tiktok}" target="_blank" class="sns-link" style="width: fit-content;">🎵 TikTok</a>` : ''}
                ${student.sns.twitter ? `<a href="${student.sns.twitter}" target="_blank" class="sns-link" style="width: fit-content;">🐦 X</a>` : ''}
            </div>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">✍️ 自己PR</h3>
            <p style="color: var(--color-text); line-height: 1.8;">${student.bio}</p>
        </div>
        
        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
            <button onclick="contactStudent('${student.email}')" style="flex: 1; background: var(--color-primary); border: none; color: var(--color-bg); padding: 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                📧 メール
            </button>
            <button onclick="exportStudentData(${JSON.stringify(student).replace(/"/g, '&quot;')})" style="flex: 1; background: var(--color-secondary); border: none; color: white; padding: 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                💾 データ出力
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}
// ========================================
// モーダル閉じる
// ========================================
function closeModal() {
    document.getElementById('studentModal').classList.remove('active');
}

// ========================================
// 統計更新
// ========================================
function updateStats() {
    document.getElementById('totalStudents').textContent = studentsData.length;
    document.getElementById('resultCount').textContent = filteredStudents.length;
    
    const matched = filteredStudents.filter(s => calculateMatchScore(s) >= 80).length;
    document.getElementById('matchedStudents').textContent = matched;
}

// ========================================
// メール送信
// ========================================
function contactStudent(email) {
    window.location.href = `mailto:${email}?subject=お問い合わせ&body=こんにちは、`;
}

// ========================================
// データ出力
// ========================================
function exportStudentData(student) {
    const dataStr = JSON.stringify(student, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.name}_data.json`;
    link.click();
    
    console.log('💾 データ出力完了');
}