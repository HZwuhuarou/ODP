// 食谱页面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 从JSON文件加载食谱数据
    fetch('../data/recipes.json')
        .then(response => response.json())
        .then(data => {
            const recipes = data;
            // 页面加载时直接显示所有食谱
            displayRecipes(recipes);
            
            // 设置搜索功能
            setupSearch(recipes);
        })
        .catch(error => console.error('加载食谱数据失败:', error));
});

function displayRecipes(recipes, searchTerm = '', searchType = 'name') {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';
    
    // 如果没有食谱，显示提示信息
    if (recipes.length === 0) {
        recipeList.innerHTML = '<p class="no-results">没有找到匹配的食谱</p>';
        return;
    }
    
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        // 高亮匹配的搜索词
        let nameDisplay = recipe.name;
        let ingredientsDisplay = recipe.ingredients.join(', ');
        let diseaseDisplay = recipe.disease.join(', ');
        
        if (searchTerm) {
            if (searchType === 'name') {
                nameDisplay = highlightSearchTerm(recipe.name, searchTerm);
            } else if (searchType === 'ingredients') {
                ingredientsDisplay = highlightSearchTerm(ingredientsDisplay, searchTerm);
            } else if (searchType === 'disease') {
                diseaseDisplay = highlightSearchTerm(diseaseDisplay, searchTerm);
            }
        }
        
        recipeCard.innerHTML = `
            <h3>${nameDisplay}</h3>
            <div class="recipe-meta">
                <span>主要食材: ${ingredientsDisplay}</span>
                <span>适用: ${diseaseDisplay}</span>
            </div>
            <div class="recipe-actions">
                <button class="btn primary add-to-plan" data-id="${recipe.id}">添加到计划</button>
            </div>
        `;
        
        recipeList.appendChild(recipeCard);
    });
    
    // 添加事件监听器到"添加到计划"按钮
    document.querySelectorAll('.add-to-plan').forEach(button => {
        button.addEventListener('click', function() {
            const recipeId = this.getAttribute('data-id');
            // 这里可以添加将食谱添加到计划的逻辑
            alert(`食谱ID ${recipeId} 已添加到计划`);
        });
    });
}

// 高亮搜索词
function highlightSearchTerm(text, term) {
    const regex = new RegExp(term, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

function setupSearch(recipes) {
    const searchInput = document.getElementById('recipe-search');
    const searchBtn = document.getElementById('search-btn');
    const searchTypeRadios = document.getElementsByName('search-type');
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        let searchType = 'name';
        
        // 获取选中的搜索类型
        searchTypeRadios.forEach(radio => {
            if (radio.checked) {
                searchType = radio.value;
            }
        });
        
        // 如果没有搜索词，显示所有食谱
        if (!searchTerm) {
            displayRecipes(recipes);
            return;
        }
        
        // 根据搜索类型和搜索词过滤食谱
        const filteredRecipes = recipes.filter(recipe => {
            if (searchType === 'name') {
                return recipe.name.toLowerCase().includes(searchTerm);
            } else if (searchType === 'ingredients') {
                return recipe.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes(searchTerm)
                );
            } else if (searchType === 'disease') {
                return recipe.disease.some(d => 
                    d.toLowerCase().includes(searchTerm)
                );
            }
            return false;
        });
        
        displayRecipes(filteredRecipes, searchTerm, searchType);
    });
    
    // 输入框回车键触发搜索
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // 清空搜索框时显示所有食谱
    searchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            displayRecipes(recipes);
        }
    });
}