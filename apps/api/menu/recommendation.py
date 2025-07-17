import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import List
from .models import MenuItem

def get_menu_recommendations_content_based(items: List[MenuItem], 
                           calorie_mins: List[int], 
                           calorie_maxes: List[int],
                           spices: List[str], 
                           vegTypesArray: List[str],
                           top_k: int = 10) -> List[MenuItem]:
    """
    Get personalized menu items recommendations using content based filtering and cosine similarity
    """
    if not items:
        return []
    
    # Create feature vectors for all items
    item_features = []
    for item in items:
        if not item.in_stock or not item.is_active:
            continue
            
        spiciness_map = {'high': 1.0, 'medium': 0.5, 'low': 0.0, None: 0.0}
        veg_pref_map = {'veg': 1, 'non-veg': 0, None: 0}
        spiciness_val = spiciness_map.get(item.spiciness, 0.0)
        veg_pref_val = veg_pref_map.get(item.is_veg, 0)
        
        feature_vector = [
            item.calories or 0,
            veg_pref_val,
            spiciness_val
        ]
        item_features.append(feature_vector)
    
    if not item_features:
        return []
    
    if calorie_mins and calorie_maxes:
        avg_calories = sum((min_cal + max_cal) / 2 
                          for min_cal, max_cal in zip(calorie_mins, calorie_maxes)) / len(calorie_mins)
    else:
        avg_calories = 500

    veg_vals={'veg': 1, 'non-veg': 0, None: 0}
    if vegTypesArray:
        veg_pref = sum(veg_vals.get(veg_type, 0) for veg_type in vegTypesArray) / len(vegTypesArray)
    else:
        veg_pref = 0.5
    
    spice_values = {'low': 0.0, 'medium': 0.5, 'high': 1.0}
    if spices:
        avg_spiciness = sum(spice_values.get(spice, 0) for spice in spices) / len(spices)
    else:
        avg_spiciness = 0.25

    
    
    user_vector = [avg_calories, veg_pref, avg_spiciness]
    
    scaler = StandardScaler()
    item_features_scaled = scaler.fit_transform(item_features)
    user_vector_scaled = scaler.transform([user_vector])[0]
    
    similarities = cosine_similarity([user_vector_scaled], item_features_scaled)[0]
    
    active_items = [item for item in items if item.in_stock and item.is_active]
    item_scores = list(zip(active_items, similarities))
    item_scores.sort(key=lambda x: x[1], reverse=True)
    
    return [item for item, _ in item_scores[:top_k]]