from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pricing_model.pkl')
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    model = None
    print(f"Peringatan: Model belum dilatih! Jalankan train_model.py terlebih dahulu. Error: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    if model is not None:
        return jsonify({"status": "healthy", "model": "loaded"}), 200
    return jsonify({"status": "unhealthy", "model": "missing"}), 503

@app.route('/predict', methods=['POST'])
def predict_price():
    if model is None:
        return jsonify({"error": "Model ML tidak tersedia di server."}), 503
    try:
        data = request.get_json()
        if not all(key in data for key in ('jarak_km', 'kapasitas', 'is_holiday')):
            return jsonify({"error": "Data input tidak lengkap. Membutuhkan jarak_km, kapasitas, is_holiday"}), 400
        input_data = pd.DataFrame([{
            'jarak_km': float(data['jarak_km']),
            'kapasitas': int(data['kapasitas']),
            'is_holiday': int(data['is_holiday'])
        }])
        prediksi = model.predict(input_data)[0]
        return jsonify({
            "message": "Prediksi harga berhasil",
            "input": data,
            "prediksi_harga": round(prediksi, 2)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3140)