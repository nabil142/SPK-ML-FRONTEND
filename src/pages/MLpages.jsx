import { useState, useEffect } from 'react'
import { trainModel, predictScore, getModelStatus } from '../services/api'
import Button from '../components/Button'

export default function MLPage() {

  // ── STATE ─────────────────────────────────────
  const [criteriaList, setCriteriaList] = useState([])
  const [features, setFeatures] = useState({})
  const [selectedMethod, setSelectedMethod] = useState('SAW')

  const [modelStatus, setModelStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)

  const [trainingLoading, setTrainingLoading] = useState(false)
  const [predictLoading, setPredictLoading] = useState(false)

  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState("")

  const METHODS = ['SAW', 'WP', 'TOPSIS', 'SMART', 'AHP']

  // ── LOAD TOP CRITERIA ─────────────────────────
  useEffect(() => {
    loadCriteria()
  }, [])

  const loadCriteria = async () => {
    try {
      const res = await fetch('/api/v1/ml/criteria')
      const data = await res.json()

      console.log("RAW:", data)

      // 🔥 FIX UTAMA
      const list = Array.isArray(data.data) ? data.data : []

      console.log("LIST:", list)

      setCriteriaList(list)

      // 🔥 INIT FEATURES
      const init = {}
      list.forEach(c => {
        init[c] = ''
      })
      setFeatures(init)

    } catch (err) {
      console.error("ERROR LOAD CRITERIA:", err)
    }
  }
  // ── LOAD MODEL STATUS ─────────────────────────
  useEffect(() => {
    loadStatus()
  }, [selectedMethod])

  const loadStatus = async () => {
    setStatusLoading(true)
    try {
      const res = await getModelStatus(selectedMethod)
      setModelStatus(res.data?.data ?? null)
    } catch {
      setModelStatus(null)
    } finally {
      setStatusLoading(false)
    }
  }

  // ── TRAIN ─────────────────────────────────────
  const handleTrain = async () => {
    setTrainingLoading(true)
    setError(null)
    setMessage("Melatih model...")

    try {
      await trainModel(selectedMethod)

      // refresh status
      await loadStatus()

      setMessage("✅ Model berhasil dilatih!")

    } catch (err) {
      console.error(err)
      setError("❌ Gagal melatih model")
      setMessage("")
    } finally {
      setTrainingLoading(false)
    }
  }

  // ── PREDICT ───────────────────────────────────
const handlePredict = async () => {
  setPredictLoading(true)
  setPrediction(null)
  setError(null)

  try {
    const res = await predictScore(selectedMethod, features)

    const result = res.data?.data
    setPrediction(result)

    // 🔥 SIMPAN KE DATABASE
    await fetch('/api/v1/ml/save-prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        predicted_score: result.predicted_score,
        predicted_rank: result.estimated_rank
      })
    })

  } catch (err) {
    console.error(err)
    setError("Gagal prediksi")
  } finally {
    setPredictLoading(false)
  }
}

  const formatLabel = (name) =>
    name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const isReady = modelStatus?.is_trained

  // ── UI ────────────────────────────────────────
  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">

      <h1 className="text-2xl text-white font-bold">
        🤖 Machine Learning (Global)
      </h1>


      {/* METHOD */}
      <div className="flex gap-2 flex-wrap">
        {METHODS.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMethod(m)}
            className={`px-4 py-2 rounded ${selectedMethod === m
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300'
              }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* STATUS */}
      <div className="text-sm text-slate-400">
        {statusLoading
          ? "🔄 Mengecek status model..."
          : modelStatus?.is_trained
            ? "✅ Model sudah dilatih"
            : "⚠️ Model belum dilatih"}
      </div>

      {/* TRAIN BUTTON */}
      <Button onClick={handleTrain} loading={trainingLoading}>
        {trainingLoading ? "Melatih model..." : "Latih Model"}
      </Button>

      {/* MESSAGE */}
      {message && (
        <div className="text-green-400 text-sm">
          {message}
        </div>
      )}

      {/* INPUT + PREDICT */}
      {isReady && (
        <div className="space-y-4 mt-4">

          <h2 className="text-white font-semibold">
            Masukkan Nilai Kriteria
          </h2>

          {criteriaList.map(name => (
            <div key={name}>
              <label className="text-white text-sm">
                {formatLabel(name)}
              </label>
              <input
                type="number"
                value={features[name]}
                onChange={e => setFeatures({
                  ...features,
                  [name]: e.target.value
                })}
                className="w-full p-2 mt-1 bg-slate-800 text-white rounded"
              />
            </div>
          ))}

          <Button onClick={handlePredict} loading={predictLoading}>
            {predictLoading ? "Menghitung..." : "Prediksi"}
          </Button>
        </div>
      )}

      {/* RESULT */}
      {prediction && (
        <div className="bg-slate-800 p-4 rounded text-white mt-4">
          <p>📊 Skor Prediksi: <b>{prediction.predicted_score}</b></p>
          <p>🏆 Estimasi Ranking: <b>{prediction.estimated_rank}</b></p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded">
          {error}
        </div>
      )}

    </div>
  )
}