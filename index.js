const {DateTime,} = luxon

const mainElem = document.querySelector('#main')
mainElem.innerHTML = `The time is ${DateTime.local(2018, 1, 22, 9).toFormat('t')}`
