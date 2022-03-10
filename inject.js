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

const getFile = (url, cb) => {
  const req = new XMLHttpRequest();
  req.open('GET', url);
  req.send();
  req.addEventListener('load', e => {
    cb(e.currentTarget.responseText)
  });
}

const parse = (text) => {
  const lines = text.split('\n').filter(l => !!l)
  const structures = lines.map(line => {
    const spaces = line.match(/^ */g)[0].length
    const level = Math.ceil(spaces / 2)
    let sel = line.slice(spaces)
    const multi = sel.endsWith('*') && !sel.endsWith('>*') && !sel.endsWith(' *')
    if (multi) sel = sel.slice(0, -1)
    const label = sel.split(/[\.#]/)[0] || 'div'
    const id = sel.split(/[\.#]/)[1] || ''
    const classes = sel.split('.').slice(1, -1)
    return { level, label, id, classes }
  })

  const nest = (level, structs, arr) => {
    while (structs.length) {
      const cur = structs[0]
      if (cur.level > level) {
        const newArr = [{
          label: cur.label,
          id: cur.id,
          classes: cur.classes,
          multi: cur.multi,
        }]
        arr[arr.length-1].children = newArr
        structs.shift()
        nest(level + 1, structs, newArr)
      } else if (cur.level === level) {
        arr.push({
          label: cur.label,
          id: cur.id,
          classes: cur.classes,
          multi: cur.multi,
        })
        structs.shift()
      } else return
    }
  }
  const arr = []
  nest(0, structures, arr)
  return arr
}

const listen = (cb) => {
  const main = one('#main')
  observeDOM(main, cb)
}

getFile('//harlos.me/godfield/styles.sass', text => {
  const main = one('#main')
  listen(() => {
    const selectors = ['#main']
    const addIdClass = (struct, i) => {
      const newSel = `${struct.label}:nth-child(${struct.multi ? `n+${i + 2}` : i + 1})`
      selectors.push(newSel)
      const sel = selectors.join('>');
      [...all(sel)].forEach(ele => {
        ele.setAttribute('id', struct.id)
        ele.setAttribute('class', struct.classes.join(' '))
      })
      if (struct.children) struct.children.forEach(addIdClass)
      selectors.pop()
    }
    structures = parse(text)
    structures[0].children.forEach(addIdClass)
  })
})
