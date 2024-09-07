// Initialize particles.js with space-like effect
particlesJS('particles-js', {
    "particles": {
      "number": {
        "value": 100,  // Number of particles (stars)
        "density": {
          "enable": true,
          "value_area": 800  // Adjust particle density
        }
      },
      "color": {
        "value": "#ffffff"  // White particles (like stars)
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        }
      },
      "opacity": {
        "value": 0.8,
        "random": true,
        "anim": {
          "enable": false
        }
      },
      "size": {
        "value": 2,
        "random": true
      },
      "line_linked": {
        "enable": false  // No lines, to resemble stars
      },
      "move": {
        "enable": true,
        "speed": 0.3,  // Slow movement to simulate stars moving in space
        "direction": "right",  // Move particles from left to right
        "random": false,
        "straight": true,  // Move in a straight line
        "out_mode": "out",  // Exit and re-enter from the left side
        "bounce": false
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "grab"  // Particles are "grabbed" when hovered
        },
        "onclick": {
          "enable": true,
          "mode": "push"  // Click to add particles
        },
        "resize": true  // Adjust particles on window resize
      },
      "modes": {
        "grab": {
          "distance": 200,
          "line_linked": {
            "opacity": 0.5
          }
        },
        "bubble": {
          "distance": 400,
          "size": 4,
          "duration": 0.3,
          "opacity": 1,
          "speed": 3
        },
        "repulse": {
          "distance": 200,
          "duration": 0.4
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true  // High DPI support
  });
  