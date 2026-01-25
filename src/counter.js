export function setupCounter(element) {
  let count = 0

  const updateDisplay = (value) => {
    count = value
    element.innerHTML = `count is ${count}`
  }

  element.addEventListener('click', () => updateDisplay(count + 1))
  updateDisplay(0)
}
