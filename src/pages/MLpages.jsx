import { useEffect, useState } from 'react'

export default function MLPage() {

  // ─────────────────────────────────────
  // TOKEN
  // ─────────────────────────────────────
  const token =
    localStorage.getItem(
      'spk_token'
    )

  // ─────────────────────────────────────
  // STATE
  // ─────────────────────────────────────
  const [criteria, setCriteria] =
    useState([])

  const [selectedCriteria, setSelectedCriteria] =
    useState([])

  const [features, setFeatures] =
    useState({})

  const [prediction, setPrediction] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [alternativeName, setAlternativeName] =
    useState('')

  // ─────────────────────────────────────
  // LOAD KRITERIA
  // ─────────────────────────────────────
  useEffect(() => {

    loadCriteria()

  }, [])

  const loadCriteria = async () => {

    try {

      const res = await fetch(
        'http://127.0.0.1:5000/api/v1/ml/criteria-options',
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const data =
        await res.json()

      if (!res.ok) {

        throw new Error(
          data.error ||
          'Gagal load criteria'
        )
      }

      setCriteria(data.data || [])

    } catch (err) {

      console.error(err)

      setError(err.message)
    }
  }

  // ─────────────────────────────────────
  // TOGGLE KRITERIA
  // ─────────────────────────────────────
  const toggleCriteria = (name) => {

    setSelectedCriteria(prev => {

      if (prev.includes(name)) {

        return prev.filter(
          c => c !== name
        )
      }

      return [...prev, name]
    })
  }

  // ─────────────────────────────────────
  // HANDLE INPUT
  // ─────────────────────────────────────
  const handleInput = (
    name,
    value
  ) => {

    setFeatures(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // ─────────────────────────────────────
  // FORMAT LABEL
  // ─────────────────────────────────────
  const formatLabel = (name) => {

    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l =>
        l.toUpperCase()
      )
  }

  // ─────────────────────────────────────
  // PREDICT
  // ─────────────────────────────────────
  const handlePredict = async () => {

    try {

      setLoading(true)

      setPrediction(null)

      setError('')

      // VALIDASI
      if (!alternativeName.trim()) {

        throw new Error(
          'Nama alternatif wajib diisi'
        )
      }

      if (
        !Array.isArray(selectedCriteria) ||
        selectedCriteria.length < 1
      ) {

        throw new Error(
          'Pilih minimal 1 kriteria'
        )
      }

      // ─────────────────────────────
      // GET DATASET
      // ─────────────────────────────
      const datasetRes = await fetch(
        'http://127.0.0.1:5000/api/v1/ml/dataset?method=SAW',
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const datasetData =
        await datasetRes.json()

      if (!datasetRes.ok) {

        throw new Error(
          datasetData.error ||
          'Gagal mengambil dataset'
        )
      }

      // ─────────────────────────────
      // FEATURE INPUT USER
      // ─────────────────────────────
      const payload = {}

      selectedCriteria.forEach(name => {

        payload[name] =
          Number(features[name]) || 0
      })

      // ─────────────────────────────
      // FILTER DATASET
      // ─────────────────────────────
      const filteredFeatureInfo =
        datasetData.data.feature_info.filter(
          f =>
            selectedCriteria.includes(
              f.name
            )
        )

      const selectedIndexes =
        datasetData.data.feature_info
          .map((f, index) => ({
            name: f.name,
            index
          }))
          .filter(f =>
            selectedCriteria.includes(
              f.name
            )
          )
          .map(f => f.index)

      const filteredSamples =
        datasetData.data.samples.map(s => ({

          ...s,

          features:
            selectedIndexes.map(
              i => s.features[i]
            )
        }))

      const filteredDataset = {

        feature_info:
          filteredFeatureInfo,

        samples:
          filteredSamples
      }

      // ─────────────────────────────
      // PREDICT KE PYTHON
      // ─────────────────────────────
      const res = await fetch(
        'http://127.0.0.1:8000/ml/predict-dynamic',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({

            dataset:
              filteredDataset,

            features:
              payload
          })
        }
      )

      const data =
        await res.json()

      if (!res.ok) {

        throw new Error(
          data.error ||
          'Gagal prediksi'
        )
      }

      setPrediction(data)

      // ─────────────────────────────
      // SAVE TO DATABASE
      // ─────────────────────────────
      await fetch(
        'http://127.0.0.1:5000/api/v1/ml/save-prediction',
        {
          method: 'POST',

          headers: {

            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({

            alternative_name:
              alternativeName,

            criteria_used:
              selectedCriteria,

            predicted_score:
              data.predicted_score,

            predicted_rank:
              data.estimated_rank
          })
        }
      )

    } catch (err) {

      console.error(err)

      setError(
        err.message
      )

    } finally {

      setLoading(false)
    }
  }

  // ─────────────────────────────────────
  // UI
  // ─────────────────────────────────────
  return (

    <div className="
      p-8
      max-w-5xl
      mx-auto
      space-y-8
    ">

      {/* TITLE */}
      <div>

        <h1 className="
          text-3xl
          font-bold
          text-white
        ">

          🤖 Machine Learning

        </h1>

      </div>

      {/* NAMA ALTERNATIF */}
      <div className="
        bg-slate-900
        p-6
        rounded-2xl
      ">

        <h2 className="
          text-white
          text-lg
          font-semibold
          mb-4
        ">

          Nama Alternatif

        </h2>

        <input
          type="text"

          value={alternativeName}

          onChange={(e) =>
            setAlternativeName(
              e.target.value
            )
          }

          placeholder="
            Contoh:
            Perumahan Griya Indah
          "

          className="
            w-full
            p-3
            rounded-xl
            bg-slate-800
            text-white
          "
        />

      </div>

      {/* KRITERIA */}
      <div className="
        bg-slate-900
        p-6
        rounded-2xl
      ">

        <h2 className="
          text-white
          text-lg
          font-semibold
          mb-5
        ">

          Pilih Kriteria

        </h2>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-3
        ">

          {criteria.map(c => (

            <label
              key={c.name}
              className="
                flex
                items-center
                justify-between
                bg-slate-800
                p-3
                rounded-xl
                cursor-pointer
              "
            >

              <div className="
                flex
                items-center
                gap-3
              ">

                <input
                  type="checkbox"

                  checked={
                    selectedCriteria.includes(c.name)
                  }

                  onChange={() =>
                    toggleCriteria(c.name)
                  }
                />

                <span className="
                  text-white
                ">

                  {c.label}

                </span>

              </div>

              <span className={`
                text-xs
                px-2
                py-1
                rounded-full
                ${c.type === 'benefit'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-red-500/20 text-red-400'
                }
              `}>

                {c.type}

              </span>

            </label>

          ))}

        </div>

      </div>

      {/* INPUT */}
      {selectedCriteria.length > 0 && (

        <div className="
          bg-slate-900
          p-6
          rounded-2xl
        ">

          <h2 className="
            text-white
            text-lg
            font-semibold
            mb-5
          ">

            Input Nilai Kriteria

          </h2>

          <div className="
            space-y-4
          ">

            {selectedCriteria.map(name => (

              <div key={name}>

                <label className="
                  text-sm
                  text-slate-300
                ">

                  {formatLabel(name)}

                </label>

                <input
                  type="number"

                  value={
                    features[name] || ''
                  }

                  onChange={(e) =>
                    handleInput(
                      name,
                      e.target.value
                    )
                  }

                  className="
                    w-full
                    mt-2
                    p-3
                    rounded-xl
                    bg-slate-800
                    text-white
                  "
                />

              </div>

            ))}

          </div>

        </div>

      )}

      {/* BUTTON */}
      <button
        onClick={handlePredict}

        disabled={loading}

        className="
          bg-cyan-500
          hover:bg-cyan-600
          transition
          px-6
          py-3
          rounded-xl
          font-semibold
          text-white
        "
      >

        {loading
          ? 'Memproses...'
          : 'Prediksi'}

      </button>

      {/* RESULT */}
      {prediction && (

        <div className="
          bg-slate-900
          p-6
          rounded-2xl
          text-white
          space-y-3
        ">

          <h2 className="
            text-xl
            font-bold
          ">

            📊 Hasil Prediksi

          </h2>

          <p>
            Predicted Score:
            {' '}
            {prediction.predicted_score}
          </p>

          <p>
            Estimated Rank:
            {' '}
            #{prediction.estimated_rank}
          </p>

          <p>
            R2 Score:
            {' '}
            {prediction.r2_score}
          </p>

          <p>
            MAE:
            {' '}
            {prediction.mae}
          </p>

        </div>

      )}

      {/* ERROR */}
      {error && (

        <div className="
          bg-red-500/10
          border
          border-red-500
          text-red-400
          p-4
          rounded-xl
        ">

          {error}

        </div>

      )}

    </div>
  )
}