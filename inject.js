const observeDOM = (obj, callback) => {
  if (!obj || obj.nodeType !== 1) throw new TypeError(); 

  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  if (MutationObserver) {
    // define a new observer
    const mutationObserver = new MutationObserver(callback)

    // have the observer observe foo for changes in children
    mutationObserver.observe( obj, { childList:true, subtree:true })
    return mutationObserver
  }

  // browser support fallback
  else if (window.addEventListener) {
    obj.addEventListener('DOMNodeInserted', callback, false)
    obj.addEventListener('DOMNodeRemoved', callback, false)
  }
}

const one = (sel) => document.querySelector(sel)
const all = (sel) => document.querySelectorAll(sel)
const forEachChild = (ele, sel, cb) => {
  [...ele.querySelectorAll(sel)].forEach(cb)
}
const main = one('#main')
observeDOM(main, ()=>{
  forEachChild(main, '*', (e => {
    e.removeAttribute('id')
    e.removeAttribute('class')
  }))
})

