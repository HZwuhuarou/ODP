// 计划页面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 加载食谱数据用于快速添加
    fetch('../data/recipes.json')
        .then(response => response.json())
        .then(data => {
            const recipes = data;
            populateQuickRecipes(recipes);
            setupPlanFunctionality(recipes);
        })
        .catch(error => console.error('加载食谱数据失败:', error));
    
    // 设置日期选择器默认为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('plan-date').value = today;
    document.getElementById('selected-date').textContent = '今日计划';
    
    // 日期变化事件
    document.getElementById('plan-date').addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('selected-date').textContent = 
            selectedDate.toLocaleDateString('zh-CN', options) + ' 计划';
    });
});

function populateQuickRecipes(recipes) {
    const quickRecipesSelect = document.getElementById('quick-recipes');
    
    recipes.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = recipe.name;
        quickRecipesSelect.appendChild(option);
    });
}

function setupPlanFunctionality(recipes) {
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const planItemsList = document.getElementById('plan-items');
    const savePlanBtn = document.getElementById('save-plan-btn');
    const completePlanBtn = document.getElementById('complete-plan-btn');
    
    // 从本地存储加载计划
    loadPlanFromLocalStorage();
    
    // 添加食谱到计划
    addRecipeBtn.addEventListener('click', function() {
        const quickRecipesSelect = document.getElementById('quick-recipes');
        const selectedRecipeId = quickRecipesSelect.value;
        
        if (!selectedRecipeId) {
            alert('请选择一个食谱');
            return;
        }
        
        const selectedRecipe = recipes.find(recipe => recipe.id == selectedRecipeId);
        
        if (selectedRecipe) {
            addRecipeToPlan(selectedRecipe);
            updatePotentialPoints();
            quickRecipesSelect.value = '';
        }
    });
    
    // 保存计划
    savePlanBtn.addEventListener('click', function() {
        const planDate = document.getElementById('plan-date').value;
        const planItems = Array.from(planItemsList.children).map(item => {
            return {
                id: item.getAttribute('data-id'),
                name: item.querySelector('.item-name').textContent,
                completed: item.classList.contains('completed')
            };
        });
        
        localStorage.setItem(`plan-${planDate}`, JSON.stringify(planItems));
        alert('计划已保存');
    });
    
    // 完成计划
    completePlanBtn.addEventListener('click', function() {
        const planDate = document.getElementById('plan-date').value;
        const planItems = Array.from(planItemsList.children);
        
        // 标记所有项目为完成
        planItems.forEach(item => {
            item.classList.add('completed');
            const checkbox = item.querySelector('.item-completed');
            if (checkbox) checkbox.checked = true;
        });
        
        // 保存完成状态
        const completedPlanItems = planItems.map(item => {
            return {
                id: item.getAttribute('data-id'),
                name: item.querySelector('.item-name').textContent,
                completed: true
            };
        });
        
        localStorage.setItem(`plan-${planDate}`, JSON.stringify(completedPlanItems));
        
        // 添加到已完成计划列表
        const completedPlans = JSON.parse(localStorage.getItem('completedPlans') || '[]');
        completedPlans.push({
            date: planDate,
            points: calculatePoints(completedPlanItems)
        });
        localStorage.setItem('completedPlans', JSON.stringify(completedPlans));
        
        // 更新显示
        updatePotentialPoints();
        loadCompletedPlans();
        
        alert(`计划完成! 获得 ${calculatePoints(completedPlanItems)} 积分`);
    });
}

function addRecipeToPlan(recipe) {
    const planItemsList = document.getElementById('plan-items');
    
    // 检查是否已添加
    const existingItem = Array.from(planItemsList.children).find(item => 
        item.getAttribute('data-id') == recipe.id
    );
    
    if (existingItem) {
        alert('该食谱已在计划中');
        return;
    }
    
    const planItem = document.createElement('li');
    planItem.setAttribute('data-id', recipe.id);
    
    planItem.innerHTML = `
        <div>
            <input type="checkbox" class="item-completed">
            <span class="item-name">${recipe.name}</span>
        </div>
        <button class="btn small remove-item">移除</button>
    `;
    
    // 添加事件监听器
    const checkbox = planItem.querySelector('.item-completed');
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            planItem.classList.add('completed');
        } else {
            planItem.classList.remove('completed');
        }
        updatePotentialPoints();
    });
    
    const removeBtn = planItem.querySelector('.remove-item');
    removeBtn.addEventListener('click', function() {
        planItem.remove();
        updatePotentialPoints();
    });
    
    planItemsList.appendChild(planItem);
}

function loadPlanFromLocalStorage() {
    const planDate = document.getElementById('plan-date').value;
    const savedPlan = localStorage.getItem(`plan-${planDate}`);
    
    if (savedPlan) {
        const planItems = JSON.parse(savedPlan);
        const planItemsList = document.getElementById('plan-items');
        planItemsList.innerHTML = '';
        
        // 需要先加载食谱数据
        fetch('../data/recipes.json')
            .then(response => response.json())
            .then(recipes => {
                planItems.forEach(item => {
                    const recipe = recipes.find(r => r.id == item.id);
                    if (recipe) {
                        const planItem = document.createElement('li');
                        planItem.setAttribute('data-id', recipe.id);
                        planItem.innerHTML = `
                            <div>
                                <input type="checkbox" class="item-completed" ${item.completed ? 'checked' : ''}>
                                <span class="item-name">${recipe.name}</span>
                            </div>
                            <button class="btn small remove-item">移除</button>
                        `;
                        
                        if (item.completed) {
                            planItem.classList.add('completed');
                        }
                        
                        // 添加事件监听器
                        const checkbox = planItem.querySelector('.item-completed');
                        checkbox.addEventListener('change', function() {
                            if (this.checked) {
                                planItem.classList.add('completed');
                            } else {
                                planItem.classList.remove('completed');
                            }
                            updatePotentialPoints();
                        });
                        
                        const removeBtn = planItem.querySelector('.remove-item');
                        removeBtn.addEventListener('click', function() {
                            planItem.remove();
                            updatePotentialPoints();
                        });
                        
                        planItemsList.appendChild(planItem);
                    }
                });
                
                updatePotentialPoints();
                loadCompletedPlans();
            })
            .catch(error => console.error('加载食谱数据失败:', error));
    } else {
        loadCompletedPlans();
    }
}

function updatePotentialPoints() {
    const planItems = Array.from(document.getElementById('plan-items').children);
    const potentialPoints = calculatePoints(planItems);
    document.getElementById('potential-points').textContent = potentialPoints;
}

function calculatePoints(items) {
    // 每个完成的食谱项目获得10积分
    return items.filter(item => item.classList.contains('completed')).length * 10;
}

function loadCompletedPlans() {
    const completedPlansList = document.getElementById('completed-plans-list');
    const completedPlans = JSON.parse(localStorage.getItem('completedPlans') || '[]');
    
    completedPlansList.innerHTML = '';
    
    if (completedPlans.length === 0) {
        completedPlansList.innerHTML = '<p>暂无已完成计划</p>';
        return;
    }
    
    // 按日期降序排序
    completedPlans.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    completedPlans.forEach(plan => {
        const planElement = document.createElement('div');
        planElement.className = 'completed-plan-item';
        
        const date = new Date(plan.date);
        const formattedDate = date.toLocaleDateString('zh-CN', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
        
        planElement.innerHTML = `
            <p><strong>${formattedDate}</strong> - 获得 ${plan.points} 积分</p>
        `;
        
        completedPlansList.appendChild(planElement);
    });
}