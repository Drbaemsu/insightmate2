let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CustomerDB', 1);
        
        request.onerror = event => reject('IndexedDB 초기화 실패');
        
        request.onsuccess = event => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            const objectStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('name', 'name', { unique: false });
            objectStore.createIndex('company', 'company', { unique: false });
        };
    });
}

function saveCustomer(customerData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['customers'], 'readwrite');
        const objectStore = transaction.objectStore('customers');
        const request = objectStore.add(customerData);
        
        request.onerror = event => reject('고객 정보 저장 실패');
        request.onsuccess = event => resolve(event.target.result);
    });
}

function loadCustomers() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['customers'], 'readonly');
        const objectStore = transaction.objectStore('customers');
        const request = objectStore.getAll();
        
        request.onerror = event => reject('고객 정보 불러오기 실패');
        request.onsuccess = event => resolve(event.target.result);
    });
}

function deleteCustomer(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['customers'], 'readwrite');
        const objectStore = transaction.objectStore('customers');
        const request = objectStore.delete(id);
        
        request.onerror = event => reject('고객 정보 삭제 실패');
        request.onsuccess = event => resolve();
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const salesTab = document.getElementById('sales-tab');
    const profileTab = document.getElementById('profile-tab');
    const salesContent = document.getElementById('sales-content');
    const profileContent = document.getElementById('profile-content');
    const profileImage = document.getElementById('profile-image');
    const fileInput = document.getElementById('file-input');
    const saveButton = document.querySelector('.save-button');
    const modal = document.getElementById('saveModal');
    const closeModal = document.querySelector('.close');
    const addCustomerButton = document.getElementById('add-customer-button');
    const customerModal = document.getElementById('customerModal');
    const closeCustomerModal = customerModal.querySelector('.close');
    const addCustomerForm = document.getElementById('addCustomerForm');
    const closeAddCustomerForm = addCustomerForm.querySelector('.close');
    const customerProfileImage = document.getElementById('customer-profile-image');
    const customerFileInput = document.getElementById('customer-file-input');

    const salesTalkModal = document.getElementById('salesTalkModal');
    const customerNameTitle = document.getElementById('customerNameTitle');
    const customerProfileImageInModal = document.getElementById('customerProfileImage');
    const physiognomyAnalysis = document.getElementById('physiognomyAnalysis');
    const aiSalesTalk = document.getElementById('aiSalesTalk');

    // 새로 추가된 요소들
    const autoAddCustomerForm = document.getElementById('autoAddCustomerForm');
    const cardPhotoPlaceholder = document.getElementById('card-photo-placeholder');
    const fetchCustomerInfoButton = document.getElementById('fetch-customer-info');

    try {
        await initDB();
    } catch (error) {
        console.error('IndexedDB 초기화 실패:', error);
        alert('데이터베이스 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
        return;
    }

    function showSalesTab() {
        salesTab.classList.add('active');
        profileTab.classList.remove('active');
        salesContent.style.display = 'block';
        profileContent.style.display = 'none';
        addCustomerButton.style.display = 'block';
    }

    function showProfileTab() {
        profileTab.classList.add('active');
        salesTab.classList.remove('active');
        profileContent.style.display = 'block';
        salesContent.style.display = 'none';
        addCustomerButton.style.display = 'none';
    }

    salesTab.addEventListener('click', showSalesTab);
    profileTab.addEventListener('click', function() {
        showProfileTab();
        loadProfile();
    });

    showSalesTab();
    addCustomerButton.style.display = 'block';

    profileImage.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = profileImage.querySelector('img');
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    function saveProfile() {
        const name = document.getElementById('name-input').value;
        const gender = document.querySelector('.gender-button.active') ? document.querySelector('.gender-button.active').dataset.gender : '';
        const birthYear = document.getElementById('birth-year-input').value;
        const hometown = document.getElementById('hometown-input').value;
        const highschool = document.getElementById('highschool-input').value;
        const university = document.getElementById('university-input').value;
        const graduate = document.getElementById('graduate-input').value;
        const experience1 = document.getElementById('experience1-input').value;
        const experience2 = document.getElementById('experience2-input').value;
        const experience3 = document.getElementById('experience3-input').value;
        const profileImg = profileImage.querySelector('img').src;

        const profileData = {
            name, gender, birthYear, hometown, highschool, university, graduate,
            experience1, experience2, experience3, profileImg
        };

        localStorage.setItem('myProfile', JSON.stringify(profileData));

        modal.style.display = "block";
    }

    function loadProfile() {
        const savedProfile = localStorage.getItem('myProfile');
        if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            document.getElementById('name-input').value = profileData.name;
            document.getElementById('birth-year-input').value = profileData.birthYear;
            document.getElementById('hometown-input').value = profileData.hometown;
            document.getElementById('highschool-input').value = profileData.highschool;
            document.getElementById('university-input').value = profileData.university;
            document.getElementById('graduate-input').value = profileData.graduate;
            document.getElementById('experience1-input').value = profileData.experience1;
            document.getElementById('experience2-input').value = profileData.experience2;
            document.getElementById('experience3-input').value = profileData.experience3;
            profileImage.querySelector('img').src = profileData.profileImg;

            document.querySelectorAll('.gender-button').forEach(button => {
                if (button.dataset.gender === profileData.gender) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    }

    saveButton.addEventListener('click', saveProfile);

    closeModal.onclick = function() {
        modal.style.display = "none";
    }

    function resetCustomerForm() {
        addCustomerForm.reset();
        customerProfileImage.querySelector('img').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
        document.querySelectorAll('#addCustomerForm .gender-button').forEach(btn => btn.classList.remove('active'));
    }

    addCustomerButton.addEventListener('click', function() {
        resetCustomerForm();
        customerModal.style.display = "block";
    });

    closeCustomerModal.onclick = function() {
        customerModal.style.display = "none";
        resetCustomerForm();
    }

    document.querySelector('.action-button:nth-child(1)').addEventListener('click', function() {
  	customerModal.style.display = "none";
  	showDirectInputForm();
     });

    // "자동추가" 버튼 클릭 이벤트
    document.querySelector('.action-button:nth-child(2)').addEventListener('click', function() {
        customerModal.style.display = "none";
        autoAddCustomerForm.style.display = "block";
    });

    closeAddCustomerForm.onclick = function() {
        addCustomerForm.style.display = "none";
        resetCustomerForm();
    }

    customerProfileImage.addEventListener('click', function() {
        customerFileInput.click();
    });

    customerFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = customerProfileImage.querySelector('img');
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    async function loadAndDisplayCustomers() {
        try {
            const customers = await loadCustomers();
            const customerList = document.querySelector('.customer-list');
            customerList.innerHTML = '';
            
            customers.forEach(customer => {
    const li = document.createElement('li');
    li.className = 'customer-item';
    li.innerHTML = `
        <img src="${customer.profileImage}" alt="${customer.name}" class="customer-image">
        <div class="customer-info">
            <div class="customer-name">${customer.name}</div>
            <div class="customer-company">${customer.company}</div>
        </div>
        <div class="customer-actions">
            <span class="view-customer">⋮</span>
            <img src="쓰레기통.png" alt="삭제" class="delete-customer">
        </div>
    `;
    li.querySelector('.view-customer').addEventListener('click', () => openSalesTalkModal(customer));
    li.querySelector('.delete-customer').addEventListener('click', () => deleteCustomerAndReload(customer.id));
    customerList.appendChild(li);
});

            updateCustomerCount(customers.length);
        } catch (error) {
            console.error('고객 정보 불러오기 중 오류 발생:', error);
        }
    }

    async function deleteCustomerAndReload(id) {
        if (confirm('이 고객 정보를 삭제하시겠습니까?')) {
            try {
                await deleteCustomer(id);
                await loadAndDisplayCustomers();
            } catch (error) {
                console.error('고객 정보 삭제 중 오류 발생:', error);
                alert('고객 정보 삭제에 실패했습니다.');
            }
        }
    }

    function updateCustomerCount(count) {
        const countElement = document.querySelector('#sales-content h3');
        countElement.textContent = `등록된 고객정보(${count}명)`;
    }

    addCustomerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const customerName = document.getElementById('customer-name').value;
        const customerGender = document.querySelector('#addCustomerForm .gender-button.active') ? document.querySelector('#addCustomerForm .gender-button.active').dataset.gender : '';
        const customerBirthYear = document.getElementById('customer-birth-year').value;
        const customerHometown = document.getElementById('customer-hometown').value;
        const customerHighschool = document.getElementById('customer-highschool').value;
        const customerUniversity = document.getElementById('customer-university').value;
        const customerGraduate = document.getElementById('customer-graduate').value;
        const customerCompany = document.getElementById('customer-company').value;
        const customerTitle = document.getElementById('customer-title').value;
        const customerPreviousCompany1 = document.getElementById('customer-previous-company1').value;
        const customerPreviousCompany2 = document.getElementById('customer-previous-company2').value;
        const customerProfileImg = customerProfileImage.querySelector('img').src;

        const customerData = {
            name: customerName,
            gender: customerGender,
            birthYear: customerBirthYear,
            hometown: customerHometown,
            highschool: customerHighschool,
            university: customerUniversity,
            graduate: customerGraduate,
            company: customerCompany,
            title: customerTitle,
            previousCompany1: customerPreviousCompany1,
            previousCompany2: customerPreviousCompany2,
            profileImage: customerProfileImg
        };

        try {
            await saveCustomer(customerData);
            addCustomerForm.style.display = "none";
            customerModal.style.display = "none";
            alert('고객정보가 저장되었습니다.');

            resetCustomerForm();
            await loadAndDisplayCustomers();
        } catch (error) {
            console.error('고객 정보 저장 중 오류 발생:', error);
            alert('고객 정보 저장에 실패했습니다.');
        }
    });

    function openSalesTalkModal(customer) {
        customerNameTitle.textContent = `${customer.name} ${customer.company} ${customer.title}`;
        customerProfileImageInModal.src = customer.profileImage;
        physiognomyAnalysis.textContent = "얼굴 분석\n얼굴 형태: 둥근형\n•성격: 둥글둥글하고 시원한 성격으로 대인관계가 좋습니다. 사람들과 쉽게 친해지며, 친분을 잘 유지합니다.";
        aiSalesTalk.textContent = "높이 승진할 것을 강조하세요. 큰입과 코, 그리고 큰 귀는 통솔력을 나타냅니다. 조직의 리더로서 승승장구할 상입니다.";
        salesTalkModal.style.display = "block";
        
        document.getElementById('physiognomy').style.display = 'block';
        document.querySelector('.tablinks.active').classList.remove('active');
        document.querySelector('.tablinks').classList.add('active');

}

    salesTalkModal.querySelector('.close').onclick = function() {
        salesTalkModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        if (event.target == customerModal) {
            customerModal.style.display = "none";
            resetCustomerForm();
        }
        if (event.target == addCustomerForm) {
            addCustomerForm.style.display = "none";
            resetCustomerForm();
        }
        if (event.target == salesTalkModal) {
            salesTalkModal.style.display = "none";
        }
        if (event.target == autoAddCustomerForm) {
            autoAddCustomerForm.style.display = "none";
        }
    }

    document.querySelectorAll('.gender-button').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.gender-buttons').querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 명함 사진 촬영
    cardPhotoPlaceholder.addEventListener('click', function() {
        // 여기에 카메라 API를 사용하여 사진 촬영 기능을 구현합니다.
        // 웹 환경에서는 MediaDevices.getUserMedia()를 사용할 수 있습니다.
        alert('카메라가 열립니다. (실제 구현 필요)');
    });

    // 고객정보 가져오기
    fetchCustomerInfoButton.addEventListener('click', function() {
        const name = document.getElementById('auto-customer-name').value;
        const company = document.getElementById('auto-customer-company').value;
        const title = document.getElementById('auto-customer-title').value;

        if (!name || !company || !title) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        // 여기에서 실제로 고객 정보를 가져오는 API 호출을 구현합니다.
        // 예시로 알림만 표시합니다.
        alert(`${name} ${company} ${title} 고객 정보를 가져옵니다. (실제 구현 필요)`);

        // 정보를 가져온 후 처리 로직
        // 예: 폼에 정보 채우기, 데이터베이스에 저장 등
    });

    // 자동추가 폼 닫기
    autoAddCustomerForm.querySelector('.close').onclick = function() {
        autoAddCustomerForm.style.display = "none";
    };

    // 초기 고객 목록 로드
    loadAndDisplayCustomers();
});

// openTab 함수를 전역 범위에 정의
function openTab(event, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.display = 'flex';
  
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 5000);
}

document.getElementById('fetch-customer-info').addEventListener('click', function() {
  const name = document.getElementById('auto-customer-name').value;
  const company = document.getElementById('auto-customer-company').value;
  const title = document.getElementById('auto-customer-title').value;

  if (!name || !company || !title) {
    alert('모든 필드를 입력해주세요.');
    return;
  }

  showLoadingScreen();
});


function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.display = 'flex';
  
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    showDirectInputForm();
  }, 5000);
}

function showDirectInputForm() {
  const autoAddCustomerForm = document.getElementById('autoAddCustomerForm');
  const addCustomerForm = document.getElementById('addCustomerForm');
  
  // 자동 추가 폼에서 입력된 정보 가져오기
  const name = document.getElementById('auto-customer-name').value;
  const company = document.getElementById('auto-customer-company').value;
  const title = document.getElementById('auto-customer-title').value;
  
  // 직접 입력 폼 표시
  autoAddCustomerForm.style.display = 'none';
  addCustomerForm.style.display = 'block';
  
  // 직접 입력 폼에 정보 채우기
  document.getElementById('customer-name').value = name;
  document.getElementById('customer-company').value = company;
  document.getElementById('customer-title').value = title;
}
