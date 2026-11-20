import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zurwdxwlvbouijjtfcfg.supabase.co';
const supabaseKey = 'sb_publishable_sVUvI1UibS8d_b1aF-otcQ_GHLS13de';
const db = createClient(supabaseUrl, supabaseKey);

const status = document.querySelector('#status');
const list = document.querySelector('#components-list');
const searchInput = document.querySelector('#search-input');
const categoryFilter = document.querySelector('#category-filter');
const sortSelect = document.querySelector('#sort-select');

let allComponents = [];

async function loadComponents() {
    status.textContent = 'Завантаження комплектуючих...';
    list.replaceChildren();

    const { data, error } = await db
        .from('pc_components')
        .select('id, name, category, price')
        .order('id', { ascending: true });

    if (error) {
        console.error('Помилка завантаження:', error);
        status.textContent = 'Не вдалося завантажити комплектуючі. Перевірте консоль браузера.';
        return;
    }

    if (data.length === 0) {
        status.textContent = 'У каталозі поки що немає жодної комплектуючої.';
        return;
    }

    for (const component of data) {
        const item = document.createElement('li');
        item.textContent = `${component.name} (${component.category}) – ${component.price} грн`;
        list.append(item);
    }

    allComponents = data;
    renderComponents();

    status.textContent = `Знайдено комплектуючих: ${data.length}`;
}

const componentForm = document.querySelector('#component-form');
const nameInput = document.querySelector('#name');
const categoryInput = document.querySelector('#category');
const priceInput = document.querySelector('#price');

componentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const category = categoryInput.value.trim();
    const price = Number(priceInput.value);

    if (
        name.length === 0 ||
        name.length > 150 ||
        category.length === 0 ||
        category.length > 100 ||
        !Number.isInteger(price) ||
        price <= 0
    ) {
        status.textContent = 'Перевірте назву, категорію та ціну.';
        return;
    }

    const submitButton = componentForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    status.textContent = 'Додавання комплектуючої...';

    try {
        const { error } = await db
            .from('pc_components')
            .insert({ name, category, price });

        if (error) {
            console.error('Помилка додавання:', error);
            status.textContent = 'Не вдалося додати комплектуючу.';
            return;
        }

        componentForm.reset();
        await loadComponents();
    } catch (error) {
        console.error('Помилка запиту:', error);
        status.textContent = 'Не вдалося виконати запит.';
    } finally {
        submitButton.disabled = false;
    }
});

function renderComponents() {
    list.replaceChildren();

    const searchQuery = searchInput.value.trim().toLowerCase()
    
    const filtered = allComponents.filter((component) => {
    return component.name.toLowerCase().includes(searchQuery) && 
    (categoryFilter.value === 'all' || component.category === categoryFilter.value)    
    })


    if (filtered.length === 0) {
        status.textContent = 'За вашим запитом нічого не знайдено.'
        return
    }

    if (sortSelect.value === 'price-asc') {
        filtered.sort((a, b) => {
            return a.price - b.price })
    }
    else if (sortSelect.value === 'price-desc') {
        filtered.sort((a, b) => {
            return b.price - a.price})
    }
    else if (sortSelect.value === 'name-asc') {
        filtered.sort((a, b) => {
            return  a.name.localeCompare(b.name, 'uk')})
    }

        for (const component of filtered) {
        const item = document.createElement('li');
        item.textContent = `${component.name} (${component.category}) – ${component.price} грн`;
        list.append(item);
    }

    status.textContent = `Знайдено комплектуючих: ${filtered.length}`
}

searchInput.addEventListener('input', renderComponents) 
categoryFilter.addEventListener('change', renderComponents)
sortSelect.addEventListener('change', renderComponents)


loadComponents();
