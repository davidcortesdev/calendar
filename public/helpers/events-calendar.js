document.addEventListener('DOMContentLoaded', () => {
  const eventsUrl = '/src/data/events.json';
  let events = [];
  let currentDate = new Date();

  // DOM Elements
  const calendarHeader = document.querySelector('.calendar-header h2');
  const daysGrid = document.querySelector('.days-grid');
  const prevBtn = document.querySelector('.prev-month');
  const nextBtn = document.querySelector('.next-month');
  const eventsList = document.querySelector('.events-list');

  // Elementos de filtro
  const eventTypeBtn = document.getElementById('event-type-btn');
  const locationBtn = document.getElementById('location-btn');
  const eventTypeDropdown = document.getElementById('event-type-dropdown');
  const locationDropdown = document.getElementById('location-dropdown');
  const eventTypeSelected = document.getElementById('event-type-selected');
  const locationSelected = document.getElementById('location-selected');
  let selectedTypes = [];
  let selectedLocs = [];

  // Fetch events
  fetch(eventsUrl)
    .then(res => res.json())
    .then(data => {
      events = data.events.map(evt => ({
        ...evt,
        date: new Date(evt.date + 'T' + evt.time)
      }));
      renderCalendar();
    })
    .catch(err => console.error('Error cargando eventos:', err));

  // Month navigation
  prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
  nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

  // Función para crear burbuja de selección
  function createFilterBubble(value, text, type) {
    const bubble = document.createElement('span');
    bubble.className = 'inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F2BC94]/30 text-sm text-[#30110D]';
    bubble.innerHTML = `${text}<button class="ml-1 text-[#722620] hover:text-[#30110D]" data-value="${value}">×</button>`;
    bubble.querySelector('button').addEventListener('click', () => {
      if (type === 'type') {
        selectedTypes = selectedTypes.filter(t => t !== value);
        eventTypeSelected.removeChild(bubble);
      } else {
        selectedLocs = selectedLocs.filter(l => l !== value);
        locationSelected.removeChild(bubble);
      }
      renderCalendar();
    });
    return bubble;
  }

  // Manejar clicks en los botones de filtro
  eventTypeBtn.addEventListener('click', () => {
    eventTypeDropdown.classList.toggle('hidden');
    locationDropdown.classList.add('hidden');
  });

  locationBtn.addEventListener('click', () => {
    locationDropdown.classList.toggle('hidden');
    eventTypeDropdown.classList.add('hidden');
  });

  // Cerrar dropdowns al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-group')) {
      eventTypeDropdown.classList.add('hidden');
      locationDropdown.classList.add('hidden');
    }
  });

  // Manejar selección de opciones
  eventTypeDropdown.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', () => {
      const value = option.dataset.value;
      if (!selectedTypes.includes(value)) {
        selectedTypes.push(value);
        eventTypeSelected.appendChild(createFilterBubble(value, option.textContent, 'type'));
        renderCalendar();
      }
    });
  });

  locationDropdown.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', () => {
      const value = option.dataset.value;
      if (!selectedLocs.includes(value)) {
        selectedLocs.push(value);
        locationSelected.appendChild(createFilterBubble(value, option.textContent, 'location'));
        renderCalendar();
      }
    });
  });


  function renderCalendar() {
    daysGrid.innerHTML = '';
    calendarHeader.innerHTML = `
      <span class="text-[#722620]">${currentDate.toLocaleString('es-ES', { month: 'long' })}</span>
      ${currentDate.getFullYear()}`;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay + 6) % 7;

    // Empty cells
    for (let i = 0; i < offset; i++) daysGrid.appendChild(document.createElement('div'));

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const cell = document.createElement('div');
      cell.className = 'day-cell h-24 bg-white rounded-lg shadow-md border-2 border-[#F2BC94]/70 hover:border-[#722620] hover:shadow-lg transition-all duration-300 p-2 cursor-pointer flex flex-col';
      cell.innerHTML = `<span class='text-[#30110D] font-bold self-end'>${day}</span><div class='flex-grow flex flex-col gap-1 mt-2'></div>`;
      const inner = cell.querySelector('div');

      // Filter events
      const dayEvents = events.filter(evt => {
        return evt.date.getFullYear() === year && evt.date.getMonth() === month && evt.date.getDate() === day
          && (selectedTypes.length === 0 || selectedTypes.includes(evt.type))
          && (selectedLocs.length === 0 || selectedLocs.includes(evt.location));
      });

      // Indicators
      dayEvents.slice(0, 3).forEach(evt => {
        const dot = document.createElement('div');
        dot.className = 'h-2 rounded-full';
        dot.style.width = '50%';
        dot.style.backgroundColor = evt.type === 'gastronomico' ? 'rgba(242,188,148,1)' : 'rgba(114,38,32,0.7)';
        inner.appendChild(dot);
      });

      cell.addEventListener('click', () => showDayEvents(dayEvents, cellDate));
      daysGrid.appendChild(cell);
    }
  }

  // Elementos del modal
  const modal = document.getElementById('event-modal');
  const modalContent = modal.querySelector('div');
  const closeModal = document.getElementById('close-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalLocation = document.getElementById('modal-location');
  const modalLocationText = document.getElementById('modal-location-text');
  const modalDescription = document.getElementById('modal-description');

  // Función para abrir el modal
  function abrirModal(evento) {
    modalTitle.textContent = evento.title;
    modalDate.textContent = evento.date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' - ' + evento.time;
    modalLocationText.textContent = evento.location;
    modalDescription.textContent = evento.description;
    
    // Configurar enlace a Google Maps
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.location + ', Comunidad Valenciana, España')}`;
    modalLocation.href = mapsUrl;

    // Mostrar modal con animación
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
  }

  // Función para cerrar el modal
  function cerrarModal() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }, 300);
  }

  // Event listeners para el modal
  closeModal.addEventListener('click', cerrarModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) cerrarModal();
  });

  function showDayEvents(list, date) {
    eventsList.innerHTML = '';
    if (list.length === 0) {
      eventsList.innerHTML = `<p class='text-[#30110D]/80'>No hay eventos para el ${date.toLocaleDateString('es-ES')}.</p>`;
      return;
    }
    list.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'event-card p-4 rounded-xl bg-[#F2BC94]/10 border-l-4 border-[#722620] shadow-md hover:shadow-lg hover:bg-[#F2BC94]/20 transition-all duration-300 cursor-pointer';
      card.innerHTML = `
        <h4 class='text-lg font-bold text-[#722620]'>${evt.title}</h4>
        <p class='text-[#30110D]/80 mt-2'>${evt.description}</p>
        <div class='mt-3 flex justify-between'>
          <span class='text-sm text-[#722620]/80 font-medium'>${evt.time}</span>
          <span class='text-sm text-[#30110D]/70 font-medium px-3 py-1 bg-[#F2BC94]/30 rounded-full'>${capitalize(evt.type)}</span>
        </div>`;
      card.addEventListener('click', () => abrirModal(evt));
      eventsList.appendChild(card);
    });
  }

  function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
});