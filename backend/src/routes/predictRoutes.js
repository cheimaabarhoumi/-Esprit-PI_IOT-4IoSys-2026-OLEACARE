const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const flaskUrl = process.env.ML_FLASK_URL || 'http://127.0.0.1:5000/predict';

        const resp = await axios.post(flaskUrl, req.body);

        const ml = resp.data.result;

        return res.status(200).json({
            success: true,
            data: {
                quality: ml.quality,
                quantity: ml.quantity,
                integration_mode: resp.data.integration_mode,
                timestamp: resp.data.timestamp
            }
        });

    } catch (err) {
        console.error("ML ERROR:", err.message);

        return res.status(502).json({
            success: false,
            message: 'ML service error',
            error: err.response?.data || err.message
        });
    }
});

// YOLO Detection Routes
router.post('/yolo/detect/:terrainId', async (req, res) => {
    try {
        const { terrainId } = req.params;
        const flaskUrl = process.env.ML_FLASK_URL || 'http://127.0.0.1:5000/yolo/detect-base64';

        if (!req.body.image) {
            return res.status(400).json({
                success: false,
                message: 'No image data provided'
            });
        }

        const resp = await axios.post(flaskUrl, {
            image: req.body.image
        });

        return res.status(200).json({
            success: true,
            data: resp.data.data || resp.data
        });

    } catch (err) {
        console.error("YOLO Detection ERROR:", err.message);

        return res.status(502).json({
            success: false,
            message: 'YOLO detection service error',
            error: err.response?.data || err.message
        });
    }
});

router.get('/yolo/latest/:terrainId', async (req, res) => {
    try {
        const { terrainId } = req.params;
        
        // TODO: Implement database query to get latest YOLO detection for terrain
        // For now, return mock data
        return res.status(200).json({
            success: true,
            data: {
                status: 'success',
                total_detected: 0,
                avg_confidence: 0,
                dominant_color: 'unknown',
                detections: [],
                message: 'No detection data yet'
            }
        });

    } catch (err) {
        console.error("Get YOLO Detection ERROR:", err.message);

        return res.status(500).json({
            success: false,
            message: 'Error fetching detection data',
            error: err.message
        });
    }
});

router.get('/yolo/health', async (req, res) => {
    try {
        const flaskUrl = process.env.ML_FLASK_URL || 'http://127.0.0.1:5000/yolo/health';

        const resp = await axios.get(flaskUrl);

        return res.status(200).json({
            success: true,
            data: resp.data
        });

    } catch (err) {
        console.error("YOLO Health Check ERROR:", err.message);

        return res.status(502).json({
            success: false,
            message: 'YOLO service unavailable',
            error: err.message
        });
    }
});

module.exports = router;