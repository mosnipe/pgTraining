// ログインフォームの送信処理
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');
  
    // 入力チェック
    if (!username || !password) {
      errorMessage.textContent = 'ユーザー名とパスワードを入力してください。';
      errorMessage.style.display = 'block';
      return;
    }
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        // ログイン成功
        const nextPage = result.role === 'admin' ? 'admin.html' : 'reservations.html';
        window.location.href = nextPage;
      } else {
        // ログイン失敗
        errorMessage.textContent = result.message;
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      errorMessage.textContent = 'サーバーエラーが発生しました。もう一度お試しください。';
      errorMessage.style.display = 'block';
    }
  });
  // 予約フォームの送信処理
document.getElementById('reservationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const facility = document.getElementById('facility').value;
    const start_time = document.getElementById('start_time').value;
    const end_time = document.getElementById('end_time').value;
    const purpose = document.getElementById('purpose').value.trim();
    const reservationMessage = document.getElementById('reservationMessage');
    const reservationError = document.getElementById('reservationError');
  
    // メッセージのリセット
    reservationMessage.style.display = 'none';
    reservationError.style.display = 'none';
  
    // 入力チェック
    if (!facility || !start_time || !end_time) {
      reservationError.textContent = '全ての必須項目を入力してください。';
      reservationError.style.display = 'block';
      return;
    }
  
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility_id: facility, start_time, end_time, purpose }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        // 予約成功
        reservationMessage.textContent = '予約が完了しました！';
        reservationMessage.style.display = 'block';
        document.getElementById('reservationForm').reset();
      } else {
        // 予約失敗
        reservationError.textContent = result.message;
        reservationError.style.display = 'block';
      }
    } catch (error) {
      reservationError.textContent = 'サーバーエラーが発生しました。もう一度お試しください。';
      reservationError.style.display = 'block';
    }
  });
  // 管理者メニューのボタン
const addUserBtn = document.getElementById('addUserBtn');
const addFacilityBtn = document.getElementById('addFacilityBtn');
const formSection = document.getElementById('formSection');
const adminForm = document.getElementById('adminForm');
const formTitle = document.getElementById('formTitle');
const formMessage = document.getElementById('formMessage');
const formError = document.getElementById('formError');

// メッセージをリセット
const resetMessages = () => {
  formMessage.style.display = 'none';
  formError.style.display = 'none';
};

// フォーム表示切り替え
const showForm = (title, formHtml) => {
  formTitle.textContent = title;
  adminForm.innerHTML = formHtml;
  formSection.style.display = 'block';
};

// ユーザー登録フォーム
addUserBtn.addEventListener('click', () => {
  resetMessages();
  showForm('ユーザー登録', `
    <label for="username">ユーザー名</label>
    <input type="text" id="username" name="username" required>

    <label for="password">パスワード</label>
    <input type="password" id="password" name="password" required>

    <label for="role">権限</label>
    <select id="role" name="role" required>
      <option value="">選択してください</option>
      <option value="user">一般ユーザー</option>
      <option value="admin">管理者</option>
    </select>

    <button type="submit">登録</button>
  `);
  adminForm.onsubmit = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    resetMessages();
    if (!username || !password || !role) {
      formError.textContent = 'すべての項目を入力してください。';
      formError.style.display = 'block';
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const result = await response.json();
      if (result.success) {
        formMessage.textContent = 'ユーザー登録が完了しました！';
        formMessage.style.display = 'block';
        adminForm.reset();
      } else {
        formError.textContent = result.message;
        formError.style.display = 'block';
      }
    } catch (error) {
      formError.textContent = 'サーバーエラーが発生しました。';
      formError.style.display = 'block';
    }
  };
});

// 施設登録フォーム
addFacilityBtn.addEventListener('click', () => {
  resetMessages();
  showForm('施設登録', `
    <label for="facilityName">施設名</label>
    <input type="text" id="facilityName" name="facilityName" required>

    <label for="capacity">収容人数</label>
    <input type="number" id="capacity" name="capacity" required>

    <label for="tel">内線番号</label>
    <input type="text" id="tel" name="tel">

    <button type="submit">登録</button>
  `);
  adminForm.onsubmit = async (event) => {
    event.preventDefault();
    const name = document.getElementById('facilityName').value.trim();
    const capacity = document.getElementById('capacity').value.trim();
    const tel = document.getElementById('tel').value.trim();

    resetMessages();
    if (!name || !capacity) {
      formError.textContent = '必須項目を入力してください。';
      formError.style.display = 'block';
      return;
    }

    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, capacity, tel }),
      });

      const result = await response.json();
      if (result.success) {
        formMessage.textContent = '施設登録が完了しました！';
        formMessage.style.display = 'block';
        adminForm.reset();
      } else {
        formError.textContent = result.message;
        formError.style.display = 'block';
      }
    } catch (error) {
      formError.textContent = 'サーバーエラーが発生しました。';
      formError.style.display = 'block';
    }
  };
});

  