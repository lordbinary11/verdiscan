import os
from .base_service import BasePlantService

class CassavaService(BasePlantService):
    def __init__(self):
        # Define cassava-specific configuration
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                 'models', 'cassava', 'cassava_best_model.h5')
        
        class_names = [
            'bacterial_blight',
            'brown_streak_disease', 
            'green_mottle',
            'healthy',
            'mosaic_disease'
        ]
        
        super().__init__('cassava', model_path, class_names)
