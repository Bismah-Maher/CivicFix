
import React, { useEffect, useRef, useState } from "react";
import "./RePr.css";
import { useLocation } from "react-router-dom";
import { getCurrentUser } from "../auth/auth";

import {
  ArrowRight,
  ArrowLeft,
  Check,
  Construction,
  Droplets,
  Lightbulb,
  MapPin,
  Trash2,
  Waves,
  Trees,
  X,
  Camera,
  RefreshCw,
  Navigation,
  ShieldCheck,
  AlertCircle,
  TrafficCone,
  ShieldAlert,
} from "lucide-react";

// ============================================
// REPORT CATEGORIES
// ============================================

const categories = [
  ["Roads", Construction],
  ["Streetlights", Lightbulb],
  ["Garbage", Trash2],
  ["Drainage", Waves],
  ["Water", Droplets],
  ["Public Spaces", Trees],
  ["Traffic", TrafficCone],
  ["Safety", ShieldAlert],
  ["Other Issues", PlusIcon],
];

// ============================================
// LOCATION ACCURACY LIMIT
// ============================================

// A report cannot be confirmed if GPS accuracy
// is worse than 100 meters.
const MAX_ALLOWED_ACCURACY = 200;

// ============================================
// OTHER ISSUES ICON
// ============================================

function PlusIcon({ size = 22 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.8,
      }}
    >
      +
    </span>
  );
}

// ============================================
// LOCAL STORAGE REPORT SYSTEM
// ============================================

const REPORTS_STORAGE_KEY = "civicfix_reports";
const REPORT_COUNTER_KEY = "civicfix_report_counter";

const getSavedReports = () => {
  try {
    const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
    const reports = saved ? JSON.parse(saved) : [];
    return Array.isArray(reports) ? reports : [];
  } catch (error) {
    console.error("Could not read CivicFix reports:", error);
    return [];
  }
};

const createUniqueReportId = () => {
  const year = new Date().getFullYear();

  let counter = 0;

  try {
    counter = Number.parseInt(
      localStorage.getItem(REPORT_COUNTER_KEY) || "0",
      10
    );
  } catch (error) {
    console.error("Could not read CivicFix report counter:", error);
  }

  const savedReports = getSavedReports();

  // Make sure the counter cannot create a duplicate ID even if
  // older demo data already exists in localStorage.
  const highestExistingNumber = savedReports.reduce(
    (highest, report) => {
      const match = String(report?.id || "").match(
        /^CF-\d{4}-(\d{6})$/
      );

      const number = match
        ? Number.parseInt(match[1], 10)
        : 0;

      return Math.max(highest, Number.isFinite(number) ? number : 0);
    },
    0
  );

  counter = Math.max(counter, highestExistingNumber) + 1;

  try {
    localStorage.setItem(
      REPORT_COUNTER_KEY,
      String(counter)
    );
  } catch (error) {
    console.error("Could not save CivicFix report counter:", error);
  }

  return `CF-${year}-${String(counter).padStart(6, "0")}`;
};

const saveReportToLocalStorage = (report) => {
  const reports = getSavedReports();

  const updatedReports = [
    ...reports.filter(
      (existingReport) => existingReport?.id !== report.id
    ),
    report,
  ];

  localStorage.setItem(
    REPORTS_STORAGE_KEY,
    JSON.stringify(updatedReports)
  );
};

// ============================================
// COMPONENT
// ============================================

function ReportProblem() {
  const location = useLocation();

  // ==========================================
  // CAMERA REFS
  // ==========================================

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ==========================================
  // DATA FROM WHAT NEEDS FIXING
  // ==========================================

  const passedCategory = location.state?.category || "";
  const passedProblemName = location.state?.problemName || "";
  const passedDescription = location.state?.description || "";
  const fromCategoryPage =
    location.state?.fromCategoryPage || false;

  // ==========================================
  // STEP
  // ==========================================

  const [step, setStep] = useState(
    fromCategoryPage ? 2 : 1
  );

  // ==========================================
  // CATEGORY
  // ==========================================

  const [category, setCategory] = useState(
    passedCategory
  );

  // ==========================================
  // LOCATION
  // ==========================================

  const [userLocation, setUserLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationConfirmed, setLocationConfirmed] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [addressLoading, setAddressLoading] =
    useState(false);

  // ==========================================
  // CAMERA
  // ==========================================

  const [cameraActive, setCameraActive] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [cameraLoading, setCameraLoading] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [photos, setPhotos] = useState([]);

  // ==========================================
  // DETAILS
  // ==========================================

  const [problemTitle, setProblemTitle] =
    useState(passedProblemName);

  const [description, setDescription] =
    useState(passedDescription);

  const [severity, setSeverity] =
    useState("Medium");

  // ==========================================
  // FORM ERROR
  // ==========================================

  const [formError, setFormError] =
    useState("");

  // ==========================================
  // SUBMITTED
  // ==========================================

  const [submitted, setSubmitted] =
    useState(false);

  const [submittedReportId, setSubmittedReportId] =
    useState("");

  // ==========================================
  // STOP CAMERA
  // ==========================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraReady(false);
    setCameraLoading(false);
  };

  // ==========================================
  // CLEAN CAMERA WHEN PAGE UNMOUNTS
  // ==========================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }
    };
  }, []);

  // ==========================================
  // START CAMERA
  // ==========================================

  const startCamera = async () => {
    setCameraError("");
    setFormError("");
    setCameraLoading(true);
    setCameraReady(false);

    // Camera is only available after the live problem
    // location has been explicitly confirmed.
    if (!locationConfirmed) {
      setCameraError(
        "Please confirm your live location before opening the camera."
      );
      setCameraLoading(false);
      return;
    }

    // Browser support check
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is not supported by this browser. Please use a modern browser such as Chrome or Edge."
      );
      setCameraLoading(false);
      return;
    }

    // Stop any previous stream first.
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      // First tell React to render the <video>.
      // A separate effect below attaches the stream after the
      // video element actually exists in the DOM.
      setCameraActive(true);
      setCameraLoading(false);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraLoading(false);
      setCameraReady(false);
      setCameraActive(false);

      if (error?.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access for this website in your browser settings, then try again."
        );
      } else if (error?.name === "NotFoundError") {
        setCameraError(
          "No camera was found on this device. Please connect or enable a camera and try again."
        );
      } else if (error?.name === "NotReadableError") {
        setCameraError(
          "Your camera may already be in use by another application. Close other apps using the camera and try again."
        );
      } else if (error?.name === "SecurityError") {
        setCameraError(
          "Camera access was blocked by the browser's security settings. Use localhost or HTTPS and allow camera permission."
        );
      } else {
        setCameraError(
          "The camera could not be opened. Please check your camera permission and try again."
        );
      }
    }
  };

  // ==========================================
  // ATTACH CAMERA STREAM AFTER VIDEO RENDERS
  // ==========================================

  useEffect(() => {
    if (!cameraActive) return;
    if (!streamRef.current) return;
    if (!videoRef.current) return;

    const video = videoRef.current;
    const stream = streamRef.current;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    let cancelled = false;

    const startVideoPlayback = async () => {
      if (cancelled) return;

      try {
        await video.play();

        if (!cancelled) {
          setCameraReady(true);
          setCameraLoading(false);
          setCameraError("");
        }
      } catch (error) {
        console.error("Video playback error:", error);

        if (!cancelled) {
          setCameraReady(false);
          setCameraLoading(false);
          setCameraError(
            "The camera opened, but the preview could not start. Please try again."
          );
        }
      }
    };

    if (video.readyState >= 1) {
      startVideoPlayback();
    } else {
      video.addEventListener(
        "loadedmetadata",
        startVideoPlayback,
        { once: true }
      );
    }

    return () => {
      cancelled = true;
      video.removeEventListener(
        "loadedmetadata",
        startVideoPlayback
      );
    };
  }, [cameraActive]);

  // ==========================================
  // CAPTURE PHOTO
  // ==========================================

  const capturePhoto = () => {
    setCameraError("");

    if (!cameraReady) {
      setCameraError(
        "Please wait for the camera preview to become ready."
      );
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      setCameraError(
        "Camera is not ready yet. Please try again."
      );
      return;
    }

    if (photos.length >= 3) {
      setCameraError(
        "You can capture a maximum of 3 photos."
      );
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError(
        "The camera image is not ready yet. Please wait a moment and try again."
      );
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError(
        "Unable to capture the photo. Please try again."
      );
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError(
            "The photo could not be captured. Please try again."
          );
          return;
        }

        const preview =
          URL.createObjectURL(blob);

        const newPhoto = {
          blob,
          preview,
        };

        setPhotos((currentPhotos) => {
          const updatedPhotos = [
            ...currentPhotos,
            newPhoto,
          ];

          // Stop camera automatically after
          // the third photo.
          if (updatedPhotos.length >= 3) {
            setTimeout(() => {
              stopCamera();
            }, 100);
          }

          return updatedPhotos;
        });
      },
      "image/jpeg",
      0.9
    );
  };

  // ==========================================
  // REMOVE PHOTO
  // ==========================================

  const removePhoto = (index) => {
    setPhotos((currentPhotos) => {
      const photo = currentPhotos[index];

      if (photo?.preview) {
        URL.revokeObjectURL(
          photo.preview
        );
      }

      return currentPhotos.filter(
        (_, photoIndex) =>
          photoIndex !== index
      );
    });

    setCameraError("");
  };

  // ==========================================
  // TAKE MORE PHOTOS
  // ==========================================

  const takeMorePhotos = () => {
    setCameraError("");

    if (photos.length >= 3) {
      setCameraError(
        "You have already captured the maximum of 3 photos."
      );
      return;
    }

    startCamera();
  };

  // ==========================================
  // DETECT LIVE LOCATION
  // ==========================================

  const detectLocation = () => {
    setLocationError("");
    setLocationConfirmed(false);
    setUserLocation(null);
    setAddressLoading(false);
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationError(
        "Location services are not supported by this browser."
      );

      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const accuracy =
          Math.round(
            position.coords.accuracy
          );

        // ======================================
        // IMPORTANT ACCURACY CHECK
        // ======================================

        // Do NOT accept very inaccurate locations.
        // Example:
        // ±50000m = 50km accuracy -> REJECT.
        if (
          !Number.isFinite(accuracy) ||
          accuracy > MAX_ALLOWED_ACCURACY
        ) {
          setLocationError(
            `Your location accuracy is too low (±${accuracy}m). CivicFix needs a more precise location. Please enable Precise Location/GPS, move closer to the problem or outdoors, and try again.`
          );

          setUserLocation(null);
          setLocationConfirmed(false);
          setLocationLoading(false);

          return;
        }

        const detectedLocation = {
          latitude,
          longitude,
          accuracy,
          address: "",
        };

        setUserLocation(
          detectedLocation
        );

        setLocationLoading(false);

        // ======================================
        // REVERSE GEOCODING
        // ======================================

        setAddressLoading(true);

        try {
          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                latitude
              )}&lon=${encodeURIComponent(
                longitude
              )}&zoom=18&addressdetails=1`
            );

          if (response.ok) {
            const data =
              await response.json();

            const readableAddress =
              data.display_name || "";

            setUserLocation(
              (current) => ({
                ...current,
                address:
                  readableAddress,
              })
            );
          }
        } catch (error) {
          console.error(
            "Address lookup error:",
            error
          );

          // Coordinates remain available
          // even if address lookup fails.
        } finally {
          setAddressLoading(false);
        }
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        let message =
          "Unable to detect your location. Please try again.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access for this website in your browser settings and try again.";
        }

        if (error.code === 2) {
          message =
            "Your location could not be determined. Please turn on your device location/GPS and try again.";
        }

        if (error.code === 3) {
          message =
            "Location detection timed out. Make sure location services are enabled and try again.";
        }

        setLocationError(message);
        setLocationLoading(false);
        setUserLocation(null);
        setLocationConfirmed(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================
  // CONFIRM LOCATION
  // ==========================================

  const confirmLocation = () => {
    setLocationError("");

    if (!userLocation) {
      setLocationError(
        "Please detect your live location first."
      );
      return;
    }

    // Final safety check
    if (
      !Number.isFinite(
        userLocation.accuracy
      ) ||
      userLocation.accuracy >
        MAX_ALLOWED_ACCURACY
    ) {
      setLocationError(
        `This location is not accurate enough. Current accuracy is ±${userLocation.accuracy}m. Please detect your location again.`
      );

      setLocationConfirmed(false);
      return;
    }

    setLocationConfirmed(true);

    // Move to camera only after
    // explicit confirmation.
    setStep(3);
  };

  // ==========================================
  // NEXT STEP
  // ==========================================

  const nextStep = async () => {
    setFormError("");

    // ========================================
    // STEP 1 — CATEGORY
    // ========================================

    if (step === 1) {
      if (!category) {
        setFormError(
          "Please select a problem category before continuing."
        );
        return;
      }

      setStep(2);
      return;
    }

    // ========================================
    // STEP 2 — LOCATION
    // ========================================

    if (step === 2) {
      if (!userLocation) {
        setLocationError(
          "Please detect your live location first."
        );
        return;
      }

      if (
        userLocation.accuracy >
        MAX_ALLOWED_ACCURACY
      ) {
        setLocationError(
          "Your location accuracy is too low. Please detect your location again."
        );
        return;
      }

      if (!locationConfirmed) {
        setLocationError(
          "Please confirm that this is the location of the problem."
        );
        return;
      }

      setStep(3);
      return;
    }

    // ========================================
    // STEP 3 — CAMERA
    // ========================================

    if (step === 3) {
      if (photos.length === 0) {
        setCameraError(
          "Please capture at least one photo of the problem."
        );
        return;
      }

      stopCamera();
      setStep(4);
      return;
    }

    // ========================================
    // STEP 4 — DETAILS
    // ========================================

    if (step === 4) {
      if (!problemTitle.trim()) {
        setFormError(
          "Please enter a title for the problem."
        );
        return;
      }

      if (!description.trim()) {
        setFormError(
          "Please describe the problem before continuing."
        );
        return;
      }

      if (description.trim().length < 10) {
        setFormError(
          "Please provide a little more detail about the problem."
        );
        return;
      }

      setStep(5);
      return;
    }

    // ========================================
    // STEP 5 — SUBMIT
    // ========================================

    if (step === 5) {
      // Final validation before submission
      if (!category) {
        setFormError(
          "A category is required."
        );
        return;
      }

      if (!locationConfirmed) {
        setFormError(
          "Your location must be confirmed."
        );
        return;
      }

      if (photos.length === 0) {
        setFormError(
          "At least one photo is required."
        );
        return;
      }

      if (!problemTitle.trim()) {
        setFormError(
          "A problem title is required."
        );
        return;
      }

      if (!description.trim()) {
        setFormError(
          "A problem description is required."
        );
        return;
      }

      try {
        const now = new Date().toISOString();
        const reportId = createUniqueReportId();

        const report = {
          id: reportId,
          category,
          title: problemTitle.trim(),
          description: description.trim(),
          severity,
          location: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            accuracy: userLocation.accuracy,
            address: userLocation.address || "",
          },
          // Photo files will be moved to proper server/cloud storage later.
          // For this localStorage phase, we keep the report's photo count.
          photoCount: photos.length,
          status: "submitted",
          createdAt: now,
          updatedAt: now,
          timeline: [
            {
              status: "submitted",
              label: "Report Submitted",
              timestamp: now,
            },
          ],
          verification: {
            status: "pending",
            verifiedAt: null,
          },
          assignment: {
            department: null,
            assignedAt: null,
          },
          workStartedAt: null,
          resolvedAt: null,
          rejectionReason: null,
          reportedBy: getCurrentUser()?.email || null,
        };

        saveReportToLocalStorage(report);

        stopCamera();
        setSubmittedReportId(reportId);
        setSubmitted(true);
      } catch (error) {
        console.error("Could not save CivicFix report:", error);
        setFormError(
          "Your report could not be saved. Please try submitting again."
        );
      }
    }
  };

  // ==========================================
  // BACK STEP
  // ==========================================

  const previousStep = () => {
    setFormError("");
    setLocationError("");
    setCameraError("");

    stopCamera();

    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ==========================================
  // RESET REPORT
  // ==========================================

  const startAnotherReport = () => {
    stopCamera();

    photos.forEach((photo) => {
      if (photo.preview) {
        URL.revokeObjectURL(
          photo.preview
        );
      }
    });

    setSubmitted(false);

    setSubmittedReportId("");

    setStep(1);

    setCategory("");

    setPhotos([]);

    setUserLocation(null);

    setLocationConfirmed(false);

    setLocationError("");

    setAddressLoading(false);

    setProblemTitle("");

    setDescription("");

    setSeverity("Medium");

    setCameraError("");

    setCameraReady(false);

    setCameraLoading(false);

    setFormError("");
  };

  // ==========================================
  // SUCCESS PAGE
  // ==========================================

  if (submitted) {
    return (
      <main className="page">
        <section className="success-page">
          <div className="success-icon">
            <Check />
          </div>

          <span>
            REPORT SUBMITTED
          </span>

          <h1>
            YOUR REPORT
            <br />
            <em>IS IN!</em>
          </h1>

          <p>
            Your report has been saved successfully.
            Keep this ID to track your report later.
          </p>

          <div className="report-number">
            <small>
              YOUR REPORT ID
            </small>

            <strong>
              {submittedReportId}
            </strong>
          </div>

          <button
            className="primary-btn"
            onClick={
              startAnotherReport
            }
          >
            Report Another Problem
          </button>
        </section>
      </main>
    );
  }

  // ==========================================
  // MAIN REPORT PAGE
  // ==========================================

  return (
    <main className="page">
      <section className="report-page">

        {/* ====================================
            HEADER
        ==================================== */}

        <div className="page-heading">
          <span>
            REPORT A PROBLEM
          </span>

          <h1>
            HELP US
            <br />
            <em>FIX IT.</em>
          </h1>

          <p>
            Tell us what is wrong and we'll make sure
            your report reaches the right department.
          </p>
        </div>

        {/* ====================================
            PROGRESS
        ==================================== */}

        <div className="report-progress">
          {[
            "Category",
            "Location",
            "Camera",
            "Details",
            "Review",
          ].map((item, index) => (
            <div
              key={item}
              className={
                step >= index + 1
                  ? "active"
                  : ""
              }
            >
              <span>
                {index + 1}
              </span>

              <small>
                {item}
              </small>
            </div>
          ))}
        </div>

        {/* ====================================
            STEP 1 — CATEGORY
        ==================================== */}

        {step === 1 && (
          <div className="report-card">
            <span className="step-label">
              STEP 01 / 05
            </span>

            <h2>
              WHAT'S THE ISSUE?
            </h2>

            <p>
              Select the category that best describes
              the problem.
            </p>

            <div className="report-categories">
              {categories.map(
                ([name, Icon]) => (
                  <button
                    type="button"
                    key={name}
                    className={
                      category === name
                        ? "selected"
                        : ""
                    }
                    onClick={() => {
                      setCategory(name);
                      setFormError("");
                    }}
                  >
                    <Icon size={22} />

                    <strong>
                      {name}
                    </strong>

                    {category === name && (
                      <Check size={15} />
                    )}
                  </button>
                )
              )}
            </div>

            {formError && (
              <div className="location-error">
                <AlertCircle size={16} />
                <span>
                  {formError}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ====================================
            STEP 2 — LIVE LOCATION
        ==================================== */}

        {step === 2 && (
          <div className="report-card location-step">
            <span className="step-label">
              STEP 02 / 05
            </span>

            <h2>
              WHERE IS THE
              <br />
              <em>PROBLEM?</em>
            </h2>

            <p>
              We need your live location so your report
              is connected to the actual place where
              the problem exists.
            </p>

            {/* LOCATION INTRO */}

            <div className="location-intro">
              <div className="location-intro-icon">
                <Navigation size={24} />
              </div>

              <div>
                <strong>
                  Use your live location
                </strong>

                <span>
                  Make sure you are standing near the
                  problem you want to report.
                </span>
              </div>
            </div>

            {/* DETECT LOCATION */}

            {!userLocation && (
              <div className="location-detect-card">
                <div className="location-large-icon">
                  <MapPin size={34} />
                </div>

                <h3>
                  Detect your location
                </h3>

                <p>
                  CivicFix will use your device GPS
                  to identify where you are. For a
                  reliable report, your location must
                  be accurate within 200 meters.
                </p>

                <button
                  type="button"
                  className="location-detect-btn"
                  onClick={
                    detectLocation
                  }
                  disabled={
                    locationLoading
                  }
                >
                  <MapPin size={18} />

                  {locationLoading
                    ? "Detecting your location..."
                    : "Use Live Location"}
                </button>

                {locationError && (
                  <div className="location-error">
                    <AlertCircle size={16} />

                    <span>
                      {locationError}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* DETECTED LOCATION */}

            {userLocation && (
              <div className="detected-location-card">

                <div className="detected-location-header">
                  <div className="detected-location-icon">
                    <Check size={20} />
                  </div>

                  <div>
                    <span>
                      LOCATION DETECTED
                    </span>

                    <strong>
                      Your current location
                    </strong>
                  </div>
                </div>

                {/* ADDRESS */}

                <div className="location-address">
                  <MapPin size={20} />

                  <div>
                    {addressLoading ? (
                      <span className="address-loading">
                        Finding your address...
                      </span>
                    ) : (
                      <strong>
                        {userLocation.address ||
                          "Address unavailable — coordinates are available below."}
                      </strong>
                    )}
                  </div>
                </div>

                {/* COORDINATES */}

                <div className="location-coordinates">
                  <div>
                    <span>
                      LATITUDE
                    </span>

                    <strong>
                      {userLocation.latitude.toFixed(
                        6
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      LONGITUDE
                    </span>

                    <strong>
                      {userLocation.longitude.toFixed(
                        6
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      ACCURACY
                    </span>

                    <strong>
                      ±{userLocation.accuracy}m
                    </strong>
                  </div>
                </div>

                {/* ACCURACY STATUS */}

                <div
                  className="location-confirm"
                  style={{
                    background:
                      userLocation.accuracy <=
                      MAX_ALLOWED_ACCURACY
                        ? "#f0fdf4"
                        : "#fff5f5",
                  }}
                >
                  <ShieldCheck
                    size={21}
                  />

                  <div>
                    <strong>
                      {userLocation.accuracy <=
                      MAX_ALLOWED_ACCURACY
                        ? "Location accuracy is good"
                        : "Location accuracy is too low"}
                    </strong>

                    <p>
                      {userLocation.accuracy <=
                      MAX_ALLOWED_ACCURACY
                        ? "This location is accurate enough to continue."
                        : `CivicFix requires accuracy of 200m or better. Current accuracy is ±${userLocation.accuracy}m.`}
                    </p>
                  </div>
                </div>

                {/* CONFIRM QUESTION */}

                {userLocation.accuracy <=
                  MAX_ALLOWED_ACCURACY && (
                  <div className="location-confirm">
                    <ShieldCheck size={21} />

                    <div>
                      <strong>
                        Is this where the problem is?
                      </strong>

                      <p>
                        Only confirm if you are
                        currently at the location
                        of the reported issue.
                      </p>
                    </div>
                  </div>
                )}

                {/* LOCATION ACTIONS */}

                <div className="location-actions">
                  <button
                    type="button"
                    className="location-retry-btn"
                    onClick={
                      detectLocation
                    }
                    disabled={
                      locationLoading
                    }
                  >
                    <RefreshCw size={16} />

                    {locationLoading
                      ? "Detecting..."
                      : "Detect Again"}
                  </button>

                  <button
                    type="button"
                    className="location-confirm-btn"
                    onClick={
                      confirmLocation
                    }
                    disabled={
                      userLocation.accuracy >
                      MAX_ALLOWED_ACCURACY
                    }
                    style={{
                      opacity:
                        userLocation.accuracy >
                        MAX_ALLOWED_ACCURACY
                          ? 0.5
                          : 1,
                      cursor:
                        userLocation.accuracy >
                        MAX_ALLOWED_ACCURACY
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <Check size={17} />

                    Yes, Confirm Location
                  </button>
                </div>

                {locationError && (
                  <div className="location-error">
                    <AlertCircle size={16} />

                    <span>
                      {locationError}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* LOCATION NOTE */}

            <div className="location-note">
              <span>
                ⚠
              </span>

              <p>
                <strong>
                  Important:
                </strong>{" "}
                If you are currently in Gulshan but
                the problem is in Askari, do not
                confirm your Gulshan location. Go to
                the problem location first and detect
                your live location there.
              </p>
            </div>
          </div>
        )}

        {/* ====================================
            STEP 3 — CAMERA
        ==================================== */}

        {step === 3 && (
          <div className="report-card camera-step">
            <span className="step-label">
              STEP 03 / 05
            </span>

            <h2>
              SHOW US THE
              <br />
              <em>PROBLEM.</em>
            </h2>

            <p>
              Take a clear photo of the issue using
              your camera. You can capture up to 3 photos.
            </p>

            {/* CAMERA */}

            {cameraActive && (
              <div className="camera-wrapper">
                <video
                  ref={videoRef}
                  className="camera-video"
                  autoPlay
                  playsInline
                  muted
                />

                <div className="camera-overlay">
                  <div className="camera-frame">
                    <span className="corner top-left" />
                    <span className="corner top-right" />
                    <span className="corner bottom-left" />
                    <span className="corner bottom-right" />
                  </div>

                  <div className="camera-status">
                    <span />

                    {cameraReady
                      ? "LIVE CAMERA"
                      : "STARTING CAMERA..."}
                  </div>
                </div>

                <div className="camera-controls">
                  <button
                    type="button"
                    className="camera-cancel-btn"
                    onClick={
                      stopCamera
                    }
                    aria-label="Close camera"
                  >
                    <X size={19} />
                  </button>

                  <button
                    type="button"
                    className="capture-btn"
                    onClick={
                      capturePhoto
                    }
                    disabled={
                      !cameraReady ||
                      photos.length >= 3
                    }
                    aria-label="Capture photo"
                    style={{
                      opacity:
                        !cameraReady
                          ? 0.5
                          : 1,
                    }}
                  >
                    <span />
                  </button>

                  <div className="camera-counter">
                    {photos.length}/3
                  </div>
                </div>
              </div>
            )}

            {/* OPEN CAMERA */}

            {!cameraActive &&
              photos.length < 3 && (
                <div className="camera-start-card">
                  <div className="camera-start-icon">
                    <Camera size={34} />
                  </div>

                  <h3>
                    Ready to capture the problem?
                  </h3>

                  <p>
                    CivicFix uses your camera so you
                    can provide fresh evidence from
                    the location.
                  </p>

                  <button
                    type="button"
                    className="open-camera-btn"
                    onClick={
                      startCamera
                    }
                    disabled={
                      cameraLoading
                    }
                  >
                    <Camera size={18} />

                    {cameraLoading
                      ? "Opening Camera..."
                      : "Open Camera"}
                  </button>
                </div>
              )}

            {/* PHOTOS */}

            {photos.length > 0 && (
              <div className="captured-section">
                <div className="captured-heading">
                  <div>
                    <strong>
                      Captured Photos
                    </strong>

                    <span>
                      Fresh evidence from your
                      location
                    </span>
                  </div>

                  <b>
                    {photos.length}/3
                  </b>
                </div>

                <div className="captured-grid">
                  {photos.map(
                    (photo, index) => (
                      <div
                        className="captured-photo"
                        key={photo.preview}
                      >
                        <img
                          src={
                            photo.preview
                          }
                          alt={`Captured civic issue ${
                            index + 1
                          }`}
                        />

                        <button
                          type="button"
                          className="remove-captured-photo"
                          onClick={() =>
                            removePhoto(
                              index
                            )
                          }
                          aria-label={`Remove photo ${
                            index + 1
                          }`}
                        >
                          <X size={15} />
                        </button>

                        <span>
                          {index + 1}
                        </span>
                      </div>
                    )
                  )}

                  {photos.length < 3 &&
                    !cameraActive && (
                      <button
                        type="button"
                        className="add-camera-photo"
                        onClick={
                          takeMorePhotos
                        }
                      >
                        <Camera size={23} />

                        <span>
                          Take another
                        </span>
                      </button>
                    )}
                </div>
              </div>
            )}

            {/* CAMERA ERROR */}

            {cameraError && (
              <div className="camera-error">
                <AlertCircle size={17} />

                <span>
                  {cameraError}
                </span>
              </div>
            )}

            {/* CAMERA TIP */}

            <div className="camera-tip">
              <div>
                <ShieldCheck size={18} />
              </div>

              <p>
                <strong>
                  Keep it clear:
                </strong>{" "}
                Capture the full problem and include
                nearby landmarks when possible.
              </p>
            </div>

            <canvas
              ref={canvasRef}
              style={{
                display: "none",
              }}
            />
          </div>
        )}

        {/* ====================================
            STEP 4 — DETAILS
        ==================================== */}

        {step === 4 && (
          <div className="report-card">
            <span className="step-label">
              STEP 04 / 05
            </span>

            <h2>
              TELL US MORE
            </h2>

            <p>
              A little more information helps the
              department understand the problem.
            </p>

            <label>
              Problem Title
            </label>

            <input
              className="form-field"
              placeholder="Example: Large pothole near main road"
              value={problemTitle}
              onChange={(e) => {
                setProblemTitle(
                  e.target.value
                );
                setFormError("");
              }}
            />

            <label>
              Description
            </label>

            <textarea
              className="form-field"
              placeholder="Describe what is happening..."
              value={description}
              onChange={(e) => {
                setDescription(
                  e.target.value
                );
                setFormError("");
              }}
            />

            <label>
              Severity
            </label>

            <div className="severity-options">
              {[
                "Low",
                "Medium",
                "High",
              ].map((level) => (
                <button
                  type="button"
                  key={level}
                  className={
                    severity === level
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSeverity(level)
                  }
                >
                  {level}
                </button>
              ))}
            </div>

            {formError && (
              <div className="location-error">
                <AlertCircle size={16} />

                <span>
                  {formError}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ====================================
            STEP 5 — REVIEW
        ==================================== */}

        {step === 5 && (
          <div className="report-card review-card">
            <span className="step-label">
              STEP 05 / 05
            </span>

            <h2>
              REVIEW YOUR REPORT
            </h2>

            <p>
              Check everything before submitting.
            </p>

            {/* CATEGORY */}

            <div className="review-item">
              <span>
                Category
              </span>

              <strong>
                {category ||
                  "Not selected"}
              </strong>
            </div>

            {/* PHOTOS */}

            <div className="review-item">
              <span>
                Photos
              </span>

              <strong>
                {photos.length > 0
                  ? `✓ ${photos.length} photo${
                      photos.length > 1
                        ? "s"
                        : ""
                    } captured`
                  : "No photo captured"}
              </strong>
            </div>

            {/* LOCATION */}

            <div className="review-item">
              <span>
                Location
              </span>

              <strong>
                {locationConfirmed
                  ? userLocation?.address ||
                    `${userLocation?.latitude?.toFixed(
                      6
                    )}, ${userLocation?.longitude?.toFixed(
                      6
                    )}`
                  : "Location not confirmed"}
              </strong>
            </div>

            {/* ACCURACY */}

            {userLocation && (
              <div className="review-item">
                <span>
                  GPS Accuracy
                </span>

                <strong>
                  ±{userLocation.accuracy}m
                </strong>
              </div>
            )}

            {/* PROBLEM */}

            <div className="review-item">
              <span>
                Problem
              </span>

              <strong>
                {problemTitle ||
                  "Not provided"}
              </strong>
            </div>

            {/* SEVERITY */}

            <div className="review-item">
              <span>
                Severity
              </span>

              <strong>
                {severity}
              </strong>
            </div>

            {/* DESCRIPTION */}

            {description && (
              <div className="review-description">
                <span>
                  Description
                </span>

                <p>
                  {description}
                </p>
              </div>
            )}

            {/* PHOTO REVIEW */}

            {photos.length > 0 && (
              <div className="review-photos">
                {photos.map(
                  (photo, index) => (
                    <img
                      key={photo.preview}
                      src={
                        photo.preview
                      }
                      alt={`Report evidence ${
                        index + 1
                      }`}
                    />
                  )
                )}
              </div>
            )}

            {formError && (
              <div className="location-error">
                <AlertCircle size={16} />

                <span>
                  {formError}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ====================================
            ACTION BUTTONS
        ==================================== */}

        <div className="report-actions">
          {/* BACK */}

          {step > 1 && (
            <button
              type="button"
              className="back-btn"
              onClick={
                previousStep
              }
            >
              <ArrowLeft size={16} />

              Back
            </button>
          )}

          {/* CONTINUE */}

          <button
            type="button"
            className="primary-btn"
            onClick={nextStep}
          >
            {step === 5
              ? "Submit Report"
              : step === 2
              ? "Continue to Camera"
              : step === 3
              ? "Continue to Details"
              : "Continue"}

            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default ReportProblem;

