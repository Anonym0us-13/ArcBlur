// Find the HTML elements by their class name
var elements = document.getElementsByClassName("MjjYud");

// Loop through all elements with the specified class
for (var i = 0; i < elements.length; i++) {
    // Add the tilt effect by setting the necessary attributes
    elements[i].setAttribute('data-tilt', '');

    // Initialize Vanilla Tilt for each element
    VanillaTilt.init(elements[i], {
        // Add your configuration options here
        // For example:
        max: 10,
        perspective: 1000,
        // Add more options as needed
    });
}
