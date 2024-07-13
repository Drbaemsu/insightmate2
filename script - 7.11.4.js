document.addEventListener('DOMContentLoaded', function() {
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
    const saveCustomerButton = document.getElementById('saveCustomerButton');
    const customerProfileImage = document.getElementById('customer-profile-image');
    const customerFileInput = document.getElementById('customer-file-input');

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

        // CSV 형식으로 데이터 변환 및 다운로드
        const csvData = Object.values(profileData).join(',');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `내프로필_${name}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

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

    addCustomerButton.addEventListener('click', function() {
        customerModal.style.display = "block";
    });

    closeCustomerModal.onclick = function() {
        customerModal.style.display = "none";
    }

    document.querySelector('.action-button:nth-child(1)').addEventListener('click', function() {
        customerModal.style.display = "none";
        addCustomerForm.style.display = "block";
    });

    closeAddCustomerForm.onclick = function() {
        addCustomerForm.style.display = "none";
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

    function loadCustomers() {
        const customerList = document.querySelector('.customer-list');
        customerList.innerHTML = ''; // 기존 목록 초기화
        
        // 로컬 스토리지에서 고객 정보 불러오기
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        
        customers.forEach(customer => {
            const li = document.createElement('li');
            li.className = 'customer-item';
            li.innerHTML = `
                <img src="${customer.profileImage}" alt="${customer.name}" class="customer-image">
                <div class="customer-info">
                    <div class="customer-name">${customer.name}</div>
                    <div class="customer-company">${customer.company}</div>
                </div>
                <div class="customer-actions">⋮</div>
            `;
            customerList.appendChild(li);
        });

        updateCustomerCount();
    }

    function updateCustomerCount() {
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const countElement = document.querySelector('#sales-content h3');
        countElement.textContent = `등록된 고객정보(${customers.length}명)`;
    }

    saveCustomerButton.addEventListener('click', function() {
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

        // 로컬 스토리지에 고객 정보 저장
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        customers.push(customerData);
        localStorage.setItem('customers', JSON.stringify(customers));

        // CSV 형식으로 데이터 변환
        const csvData = Object.values(customerData).join(',');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${customerName}_${customerCompany}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        addCustomerForm.style.display = "none";
        alert('고객정보가 저장되었습니다.');

        loadCustomers(); // 고객 목록 새로고침
    });

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        if (event.target == customerModal) {
            customerModal.style.display = "none";
        }
        if (event.target == addCustomerForm) {
            addCustomerForm.style.display = "none";
        }
    }

    document.querySelectorAll('.gender-button').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.gender-buttons').querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    loadCustomers(); // 페이지 로드 시 고객 목록 불러오기
});