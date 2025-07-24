import json
from datetime import datetime, timedelta
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple
from .models import MenuItem
from orders.models import Order, OrderItem
from auth.models import Customer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from collections import defaultdict
from async_lru import alru_cache
from db.session import get_async_session
async def get_collaborative_filtering_recommendations(
    items: List[MenuItem], 
    user_id: str, 
    top_k: int = 10
) -> List[MenuItem]:
    """
    Feature-based collaborative filtering using calories, spiciness, and veg preferences
    Works across tenants by comparing user preference patterns
    """
    if not items or len(items) <= 5:
        return items
    # Get user preference profiles
    user_profiles = await build_user_preference_profiles()
    
    if len(user_profiles) < 2 or user_id not in user_profiles:
        return items
    
    # Find similar users based on preference patterns
    similar_users = find_similar_preference_users(user_profiles, user_id, top_k=5)
    
    if not similar_users:
        return items
    
    # Score items based on similar users' preferences
    item_scores = score_items_by_similar_users(items, similar_users, user_profiles)
    
    # Sort and return top items
    scored_items = [(item, score) for item, score in item_scores.items()]
    scored_items.sort(key=lambda x: x[1], reverse=True)
    
    # return [item for item, _ in scored_items[:top_k]]
    return [item for item, _ in scored_items]

@alru_cache(maxsize=200, ttl=1800)
async def build_user_preference_profiles() -> Dict[str, Dict]:
    """
    Build user preference profiles based on ordered item features
    Returns: {user_id: {avg_calories, spice_preferences, veg_ratio}}
    """
    async for db in get_async_session():
        query = select(
            Customer.id.label('user_id'),
            MenuItem.calories,
            MenuItem.spiciness,
            MenuItem.is_veg,
            func.sum(OrderItem.quantity).label('quantity')
        ).select_from(Customer).join(Order).join(OrderItem).join(MenuItem).filter(
            Order.is_cancelled == False,
            OrderItem.is_cancelled == False,
            MenuItem.calories.isnot(None)
        ).group_by(Customer.id, MenuItem.calories, MenuItem.spiciness, MenuItem.is_veg)
        
        result = await db.execute(query)
        interactions = result.all()
        
        if not interactions:
            return {}
        
        # Group by user and calculate preferences
        user_data = defaultdict(list)
        for interaction in interactions:
            user_data[str(interaction.user_id)].append({
                'calories': interaction.calories,
                'spiciness': interaction.spiciness,
                'is_veg': interaction.is_veg,
                'quantity': interaction.quantity,
            })

        user_profiles = {}
        spiciness_map = {'high': 1.0, 'medium': 0.5, 'low': 0.0}
        
        for user_id, orders in user_data.items():
            total_quantity = sum(order['quantity'] for order in orders)
            
            # Weighted averages based on quantity
            avg_calories = sum(order['calories'] * order['quantity'] for order in orders) / total_quantity
            
            # Spice preference distribution
            spice_weights = defaultdict(float)
            for order in orders:
                spice_val = spiciness_map.get(order['spiciness'], 0.0)
                spice_weights[spice_val] += order['quantity']
            
            # Normalize spice preferences
            total_spice_quantity = sum(spice_weights.values())
            spice_prefs = {k: v/total_spice_quantity for k, v in spice_weights.items()}
            
            # Veg ratio
            veg_quantity = sum(order['quantity'] for order in orders if order['is_veg'])
            veg_ratio = veg_quantity / total_quantity
            
            user_profiles[user_id] = {
                'avg_calories': avg_calories,
                'spice_low': spice_prefs.get(0.0, 0.0),
                'spice_medium': spice_prefs.get(0.5, 0.0), 
                'spice_high': spice_prefs.get(1.0, 0.0),
                'veg_ratio': veg_ratio,
                'total_orders': len(orders)
            }
        
        return user_profiles



def find_similar_preference_users(user_profiles: Dict, target_user_id: str, top_k: int = 5) -> List[Tuple[str, float]]:
    """
    Find users with similar preference patterns using cosine similarity
    """
    if len(user_profiles) < 2:
        return []
    
    target_profile = user_profiles[target_user_id]
    
    # Create feature vectors
    target_vector = [
        target_profile['avg_calories'],
        target_profile['spice_low'],
        target_profile['spice_medium'],
        target_profile['spice_high'],
        target_profile['veg_ratio']
    ]
    
    other_users = []
    other_vectors = []
    
    for user_id, profile in user_profiles.items():
        if user_id != target_user_id:
            vector = [
                profile['avg_calories'],
                profile['spice_low'],
                profile['spice_medium'],
                profile['spice_high'],
                profile['veg_ratio']
            ]
            other_users.append(user_id)
            other_vectors.append(vector)
    
    if not other_vectors:
        return []
    
    # Normalize features
    scaler = StandardScaler()
    all_vectors = [target_vector] + other_vectors
    normalized_vectors = scaler.fit_transform(all_vectors)
    
    target_normalized = normalized_vectors[0].reshape(1, -1)
    others_normalized = normalized_vectors[1:]
    
    # Calculate similarities
    similarities = cosine_similarity(target_normalized, others_normalized)[0]
    
    # Return top similar users
    user_similarities = [(other_users[i], sim) for i, sim in enumerate(similarities) if sim > 0.1]
    user_similarities.sort(key=lambda x: x[1], reverse=True)
    
    return user_similarities[:top_k]


def score_items_by_similar_users(items: List[MenuItem], similar_users: List[Tuple[str, float]], 
                                user_profiles: Dict) -> Dict[MenuItem, float]:
    """
    Score items based on how well they match similar users' preferences
    """
    item_scores = {}
    spiciness_map = {'high': 1.0, 'medium': 0.5, 'low': 0.0, None: 0.0}
    
    total_similarity = sum(sim for _, sim in similar_users)
    
    for item in items:
        if not item.in_stock or not item.is_active or not item.calories:
            item_scores[item] = 0.0
            continue
            
        score = 0.0
        
        for user_id, similarity in similar_users:
            user_profile = user_profiles[user_id]
            
            # Calculate how well this item matches user's preferences
            calorie_diff = abs(item.calories - user_profile['avg_calories']) / user_profile['avg_calories']
            calorie_match = max(0, 1 - calorie_diff)  # Higher score for closer calories
            
            # Spice preference match
            item_spice_val = spiciness_map.get(item.spiciness, 0.0)
            if item_spice_val == 0.0:
                spice_match = user_profile['spice_low']
            elif item_spice_val == 0.5:
                spice_match = user_profile['spice_medium']
            else:
                spice_match = user_profile['spice_high']
            
            # Veg preference match
            if item.is_veg:
                veg_match = user_profile['veg_ratio']
            else:
                veg_match = 1 - user_profile['veg_ratio']
            
            # Combined preference score
            preference_score = (calorie_match * 0.4 + spice_match * 0.3 + veg_match * 0.3)
            score += (preference_score * similarity) / total_similarity
        
        item_scores[item] = score
    
    return item_scores


def get_menu_recommendations_content_based(items: List[MenuItem], 
                           calories: List[int], 
                           spices: List[str], 
                           vegTypesArray: List[str],
                           top_k: int = 5) -> List[MenuItem]:
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
    
    if calories:
        avg_calories = sum(calories) / len(calories)
    else:
        avg_calories = 500

    if vegTypesArray:
        veg_pref = sum(veg_pref_map.get(veg_type, 0) for veg_type in vegTypesArray) / len(vegTypesArray)
    else:
        veg_pref = 0.5
    
    if spices:
        avg_spiciness = sum(spiciness_map.get(spice, 0) for spice in spices) / len(spices)
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
    
    return [item for item, _ in item_scores]

