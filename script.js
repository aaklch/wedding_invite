let guestsData = null;

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

async function loadGuests() {
    try {
        const response = await fetch('guests.json');
        const data = await response.json();
        guestsData = data.guests;
        return true;
    } catch (error) {
        console.error('Ошибка:', error);
        return false;
    }
}

function findGuest(guestId) {
    if (!guestsData) return null;
    return guestsData.find(guest => guest.id === guestId);
}

function saveRSVP(guestId, response) {
    const rsvpData = JSON.parse(localStorage.getItem('wedding_rsvp') || '{}');
    rsvpData[guestId] = { response, date: new Date().toISOString() };
    localStorage.setItem('wedding_rsvp', JSON.stringify(rsvpData));
}

function getRSVP(guestId) {
    const rsvpData = JSON.parse(localStorage.getItem('wedding_rsvp') || '{}');
    return rsvpData[guestId];
}

// === ОТПРАВКА В GOOGLE SHEETS ===
// ВАШ УНИКАЛЬНЫЙ URL (ГОТОВ)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPdvLlK9spdDX2UU-8gxM6uwDZjaMefxh-x4smufORPwbS0-H5feERWHbIhyKpB2GZ/exec';

async function sendToGoogleSheets(guestName, guestId, response, plusOne) {
    try {
        const formData = new URLSearchParams();
        formData.append('guestName', guestName);
        formData.append('guestId', guestId);
        formData.append('response', response);
        formData.append('plusOne', plusOne);
        formData.append('timestamp', new Date().toLocaleString('ru-RU'));
        
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });
        console.log('Ответ отправлен в Google Sheets');
    } catch (error) {
        console.error('Ошибка отправки в Google Sheets:', error);
    }
}

function generateCalendar() {
    const days = ['', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
    
    let calendarHtml = '<div class="weekdays"><span>ПН</span><span>ВТ</span><span>СР</span><span>ЧТ</span><span>ПТ</span><span>СБ</span><span>ВС</span></div><div class="calendar-days">';
    
    for (let i = 0; i < 35; i++) {
        const dayNum = days[i];
        if (!dayNum && dayNum !== 0) {
            calendarHtml += '<div class="calendar-day empty"></div>';
        } else {
            const isWeddingDay = (dayNum === 6);
            calendarHtml += `<div class="calendar-day ${isWeddingDay ? 'wedding-day' : ''}">${dayNum}</div>`;
        }
    }
    calendarHtml += '</div>';
    return calendarHtml;
}

// Счетчик до свадьбы
function updateCountdown() {
    const weddingDate = new Date(2026, 8, 6, 0, 0, 0);
    const now = new Date();
    const diff = weddingDate - now;
    
    const daysElem = document.getElementById('countdown-days');
    const hoursElem = document.getElementById('countdown-hours');
    const minutesElem = document.getElementById('countdown-minutes');
    const secondsElem = document.getElementById('countdown-seconds');
    
    if (!daysElem) return;
    
    if (diff <= 0) {
        daysElem.innerHTML = '00';
        hoursElem.innerHTML = '00';
        minutesElem.innerHTML = '00';
        secondsElem.innerHTML = '00';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    daysElem.innerHTML = days.toString().padStart(2, '0');
    hoursElem.innerHTML = hours.toString().padStart(2, '0');
    minutesElem.innerHTML = minutes.toString().padStart(2, '0');
    secondsElem.innerHTML = seconds.toString().padStart(2, '0');
}

function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function showInvitation(guest) {
    const app = document.getElementById('app');
    const savedRSVP = getRSVP(guest.id);
    const calendarHtml = generateCalendar();

    app.innerHTML = `
        <div class="invitation-card">
            <div class="invitation-text">
                <h2>ДОРОГИЕ ${guest.fullName}!</h2>
                <p>Этот день станет для нас поистине незабываемым, и мы мечтаем провести его рядом с Вами.</p>
                <p style="margin-top: 15px;">Приглашаем Вас присоединиться к нашей свадьбе и украсить ее своим присутствием!</p>
            </div>
            
            <div class="calendar-section">
                <div class="calendar-label">СЕНТЯБРЬ 2026</div>
                ${calendarHtml}
            </div>
            
            <div class="vertical-line"></div>
            
            <div class="venue-section">
                <div class="venue-label">МЕСТО ПРОВЕДЕНИЯ</div>
                <div class="venue-name">УСАДЬБА ПУСЛОВСКИХЪ</div>
                <div class="venue-address">
                    г. Слоним, ул. Колхозная, д. 8
                </div>
                <a href="https://maps.yandex.ru/?text=Слоним%20ул%20Колхозная%208" 
                   target="_blank" 
                   class="venue-map-btn">
                    Построить маршрут
                </a>
            </div>
            
            <div class="heart-divider">❤</div>
            
            <div class="timing-section">
                <div class="timing-label">ПЛАН ДНЯ</div>
                <div class="timing-title">Timing</div>
                
                <div class="timing-item">
                    <div class="timing-time">13:00</div>
                    <div class="timing-event">Венчание</div>
                    <div class="timing-location">д. Суринка</div>
                </div>
                
                <div class="timing-item">
                    <div class="timing-time">15:00</div>
                    <div class="timing-event">Сбор гостей & Фуршет</div>
                </div>
                
                <div class="timing-item">
                    <div class="timing-time">16:30</div>
                    <div class="timing-event">Торжественная церемония</div>
                </div>
                
                <div class="timing-item">
                    <div class="timing-time">17:00</div>
                    <div class="timing-event">Праздничный банкет</div>
                </div>
            </div>
            
            <div class="heart-divider">❤</div>
            
            <div class="dresscode-section">
                <div class="dresscode-label">DRESS CODE</div>
                <div class="dresscode-text">
                    Мы очень старались сделать праздник красивым и будем рады,<br>
                    если в своих нарядах Вы поддержите цветовую гамму нашей семьи,<br>
                    отдав предпочтение нейтральным оттенкам:
                </div>
                <div class="dresscode-colors">
                    <div><div class="color-dot color-8"></div><div class="color-label"></div></div>
                    <div><div class="color-dot color-2"></div><div class="color-label"></div></div>
                    <div><div class="color-dot color-1"></div><div class="color-label"></div></div>
                    <div><div class="color-dot color-5"></div><div class="color-label"></div></div>
                    <div><div class="color-dot color-4"></div><div class="color-label"></div></div>
                    <div><div class="color-dot color-3"></div><div class="color-label"></div></div>
                </div>
            </div>
            
            <div class="heart-divider">❤</div>

<div class="details-section">
    <div class="details-label">ДЕТАЛИ</div>
    <div class="details-text">
        Просим не обременять себя<br>
        выбором цветов. Ваше присутствие<br>
        скрасит этот день ярче любых букетов!<br><br>
        Если вы хотите порадовать нас,<br>
        лучшим подарком станет
        бутылочка вашего любимого вина</br> 
    </div>
</div>

            
            <div class="heart-divider">❤</div>
            
            <div class="rsvp-section">
                <h3>Подтвердите присутствие ${guest.fullName}</h3>
                <div class="rsvp-buttons">
                    <button class="btn btn-yes" onclick="handleRSVP('yes', '${guest.id}')">Буду с удовольствием</button>
                    <button class="btn btn-no" onclick="handleRSVP('no', '${guest.id}')">Не смогу</button>
                </div>
                <div id="rsvpMessage" class="rsvp-message"></div>
                <div style="margin-top: 20px; font-size: 12px; color: #6a6a6a;">${plusOneText} </div>
            </div>
            
            <!-- СЧЕТЧИК ДО СВАДЬБЫ -->
            <div class="countdown-section">
                <div class="countdown-label">ДО СВАДЬБЫ ОСТАЛОСЬ</div>
                <div class="countdown-timer">
                    <div class="countdown-block">
                        <div class="countdown-number" id="countdown-days">00</div>
                        <div class="countdown-unit">Дней</div>
                    </div>
                    <div class="countdown-block">
                        <div class="countdown-number" id="countdown-hours">00</div>
                        <div class="countdown-unit">Часов</div>
                    </div>
                    <div class="countdown-block">
                        <div class="countdown-number" id="countdown-minutes">00</div>
                        <div class="countdown-unit">Минут</div>
                    </div>
                    <div class="countdown-block">
                        <div class="countdown-number" id="countdown-seconds">00</div>
                        <div class="countdown-unit">Секунд</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>SERAFIM & YANA</p>
                <p>06 | 09 | 2026</p>
            </div>
        </div>
    `;

    if (savedRSVP) {
        const msg = document.getElementById('rsvpMessage');
        if (msg) {
            msg.className = 'rsvp-message success';
            msg.innerHTML = `Вы уже ${savedRSVP.response === 'yes' ? 'подтвердили' : 'ответили'} присутствие. Спасибо!`;
        }
        document.querySelectorAll('.rsvp-buttons button').forEach(btn => btn.disabled = true);
    }
    
    startCountdown();
}

window.handleRSVP = function(response, guestId) {
    // Сохраняем в localStorage
    saveRSVP(guestId, response);
    
    // Находим данные гостя
    const guest = findGuest(guestId);
    if (guest) {
        // Отправляем в Google Sheets
        sendToGoogleSheets(guest.fullName, guestId, response, guest.plusOne);
    }
    
    // Показываем сообщение на странице
    const msg = document.getElementById('rsvpMessage');
    if (msg) {
        msg.className = 'rsvp-message success';
        msg.innerHTML = response === 'yes' ? 'Спасибо! Ждем вас с нетерпением!' : ' Спасибо за ответ! Будем скучать!';
    }
    document.querySelectorAll('.rsvp-buttons button').forEach(btn => btn.disabled = true);
};

function initScrollEffect() {
    const namesWrapper = document.getElementById('namesWrapper');
    const invitationWrapper = document.getElementById('invitationWrapper');
    
    if (!namesWrapper) return;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        if (scrollPosition > 50) {
            namesWrapper.classList.add('slide-left');
            invitationWrapper.classList.add('visible');
        } else {
            namesWrapper.classList.remove('slide-left');
            invitationWrapper.classList.remove('visible');
        }
    });
}

async function init() {
    const loaded = await loadGuests();
    if (!loaded) {
        document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center">Ошибка</div>';
        return;
    }
    
    const guestId = getUrlParameter('guest');
    let guest;
    
    if (!guestId && guestsData.length > 0) {
        guest = guestsData[0];
        window.history.pushState({}, '', `?guest=${guest.id}`);
    } else {
        guest = findGuest(guestId);
    }
    
    if (!guest) {
        document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center">Приглашение не найдено</div>';
        return;
    }
    
    showInvitation(guest);
    initScrollEffect();
    
    const video = document.getElementById('bgVideo');
    if (video) video.play().catch(e => console.log(e));
}

init();
