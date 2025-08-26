import os
from .base_service import BasePlantService

class TomatoService(BasePlantService):
    def __init__(self):
        # Define tomato-specific configuration
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                 'models', 'tomato', 'tomato_best_model.h5')
        
        class_names = [
            'bacterial_spot',
            'early_blight',
            'healthy',
            'late_blight',
            'leaf_mold',
            'mosaic_virus',
            'septoria_leaf_spot',
            'spider_mites',
            'target_spot',
            'yellow_leaf_curl_virus'
        ]
        
        super().__init__('tomato', model_path, class_names)
