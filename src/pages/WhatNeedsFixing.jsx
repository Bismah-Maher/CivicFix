import React, { useState } from "react";
import "./WNF.css";

import {
  Construction,
  Lightbulb,
  Trash2,
  Waves,
  Droplets,
  Trees,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  TrafficCone,
  ShieldAlert
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";


// ============================================
// CIVICFIX CATEGORIES
// ============================================

const categories = [
  {
    name: "Roads",
    number: "01",
    icon: Construction,
    description: "Potholes, broken roads and damaged sidewalks",
    problems: [
      "Potholes",
      "Broken roads",
      "Road cracks",
      "Damaged sidewalks",
      "Uneven roads",
      "Missing road signs"
    ]
  },

  {
    name: "Streetlights",
    number: "02",
    icon: Lightbulb,
    description: "Broken lights and dark streets",
    problems: [
      "Broken lights",
      "Dark streets",
      "Damaged poles",
      "Flickering lights",
      "Missing lights",
      "Electrical problems"
    ]
  },

  {
    name: "Garbage",
    number: "03",
    icon: Trash2,
    description: "Overflowing bins and illegal dumping",
    problems: [
      "Overflowing bins",
      "Illegal dumping",
      "Garbage piles",
      "Missed collection",
      "Dirty streets",
      "Missing bins"
    ]
  },

  {
    name: "Drainage",
    number: "04",
    icon: Waves,
    description: "Open drains, blocked drains and flooding",
    problems: [
      "Open drains",
      "Blocked drains",
      "Flooding",
      "Sewage problems",
      "Waterlogging",
      "Broken drain covers"
    ]
  },

  {
    name: "Water",
    number: "05",
    icon: Droplets,
    description: "Water leaks and broken pipelines",
    problems: [
      "Water leaks",
      "Broken pipes",
      "Low water pressure",
      "Water shortage",
      "Dirty water",
      "Broken water lines"
    ]
  },

  {
    name: "Public Spaces",
    number: "06",
    icon: Trees,
    description: "Damaged parks and public areas",
    problems: [
      "Damaged parks",
      "Broken benches",
      "Unsafe playgrounds",
      "Neglected spaces",
      "Damaged walking paths",
      "Poor maintenance"
    ]
  },

  {
    name: "Traffic",
    number: "07",
    icon: TrafficCone,
    description: "Traffic signals, signs and road safety",
    problems: [
      "Broken traffic lights",
      "Missing signs",
      "Unsafe crossings",
      "Traffic congestion",
      "Illegal parking",
      "Damaged signals"
    ]
  },

  {
    name: "Safety",
    number: "08",
    icon: ShieldAlert,
    description: "Public hazards and unsafe areas",
    problems: [
      "Unsafe areas",
      "Missing barriers",
      "Open manholes",
      "Dangerous crossings",
      "Damaged fences",
      "Public hazards"
    ]
  },

  {
    name: "Other Issues",
    number: "09",
    icon: Plus,
    description: "Other civic problems in your area",
    problems: [
      "Noise problems",
      "Stray animals",
      "Graffiti",
      "Damaged public property",
      "Tree hazards",
      "Other civic problems"
    ]
  }
];


// ============================================
// COMPONENT
// ============================================

function WhatNeedsFixing() {

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const [problemName, setProblemName] = useState("");

  const [description, setDescription] = useState("");


  // ==========================================
  // CUSTOM PROBLEM SUBMIT
  // ==========================================

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!problemName.trim() || !description.trim()) {
      return;
    }

    setShowModal(false);

    navigate("/report", {
      state: {
        problemName: problemName.trim(),
        description: description.trim(),

        // User already described the issue,
        // so Report page starts from Photo.
        fromCategoryPage: true
      }
    });
  };


  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    setShowModal(false);
  };


  return (

    <main className="page">

      {/* ======================================
          BACK BUTTON
      ====================================== */}

      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Back
      </button>


      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <section className="categories-page">

        <div className="page-heading center">

          <span>CIVICFIX CATEGORIES</span>

          <h1>
            WHAT NEEDS
            <br />
            <em>FIXING?</em>
          </h1>

          <p>
            Every problem has a category.
            <br />
            Find yours and help make your city better.
          </p>

        </div>


        {/* ====================================
            CATEGORY GRID
        ==================================== */}

        <div className="big-category-grid">

          {categories.map((category) => {

            const Icon = category.icon;

            return (

              <div
                className="big-category"
                key={category.name}
              >

                {/* TOP */}

                <div className="category-top">

                  <span>
                    {category.number}
                  </span>

                  <Icon size={30} />

                </div>


                {/* CATEGORY NAME */}

                <h2>
                  {category.name}
                </h2>


                {/* DESCRIPTION */}

                <p className="category-description">
                  {category.description}
                </p>


                {/* PROBLEMS */}

                <div className="problem-list">

                  {category.problems.map((problem) => (

                    <span key={problem}>
                      {problem}
                    </span>

                  ))}

                </div>


                {/* REPORT BUTTON */}

                <Link
                  to="/report"
                  state={{
                    category: category.name,
                    fromCategoryPage: true
                  }}
                >

                  Report a Problem

                  <ArrowRight size={15} />

                </Link>

              </div>

            );

          })}


          {/* ==================================
              ADD YOUR OWN PROBLEM
          ================================== */}

          <div className="add-problem-card">

            <div className="add-problem-icon">
              <Plus size={32} />
            </div>


            <span className="add-problem-label">
              CAN'T FIND YOUR ISSUE?
            </span>


            <h2>
              ADD YOUR
              <br />
              <em>OWN PROBLEM</em>
            </h2>


            <p>
              Don't see your problem listed?
              Tell us what needs fixing.
            </p>


            <button
              className="add-problem-button"
              onClick={() => setShowModal(true)}
            >

              Add Your Problem

              <ArrowRight size={16} />

            </button>

          </div>

        </div>

      </section>


      {/* ======================================
          CUSTOM PROBLEM MODAL
      ====================================== */}

      {showModal && (

        <div
          className="problem-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="problem-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE */}

            <button
              className="modal-close"
              onClick={closeModal}
            >
              <X size={20} />
            </button>


            {/* LABEL */}

            <span>
              NEW CIVIC ISSUE
            </span>


            {/* TITLE */}

            <h2>
              WHAT NEEDS
              <br />
              <em>FIXING?</em>
            </h2>


            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <label>
                Problem Name
              </label>

              <input
                type="text"
                placeholder="e.g. Broken footpath"
                value={problemName}
                onChange={(e) =>
                  setProblemName(e.target.value)
                }
              />


              <label>
                Description
              </label>

              <textarea
                placeholder="Describe the problem and where you noticed it..."
                rows="5"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />


              <button
                type="submit"
                className="modal-submit"
              >

                Continue to Report

                <ArrowRight size={17} />

              </button>

            </form>

          </div>

        </div>

      )}

    </main>

  );
}


export default WhatNeedsFixing;