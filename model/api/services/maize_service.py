import os
from .base_service import BasePlantService

class MaizeService(BasePlantService):
    def __init__(self):
        # Define maize-specific configuration
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                 'models', 'maize', 'maize_best_model.h5')
        
        class_names = [
            'common_rust',
            'gray_leaf_spot',
            'healthy',
            'northern_leaf_blight'
        ]
        
        super().__init__('maize', model_path, class_names)
