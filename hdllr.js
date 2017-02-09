/**
 * Class responsible to listen, observe and secure the page
 */
class Hdllr {
    /**
     * Instantiate a new Hdllr
     * @param el: elemt to attach it in order to listen
     * @param crypt: an encryption object
     */
    constructor(el, crypt) {
        this.el = el
        this._mind = {
            vocabulary: {
                words: [],
                expressions: []
            }
        }
        var crypt = crypt || window.crypto
        this._crypt = crypt.subtle

        this.aes = {
            name: 'AES-CTR',
            counter: this.counter,
            length: 128
        }

        this.aes_k = {
            name: 'AES-CTR',
            length: 256
        }
    }

    /**
     * Crypt related
     */
    get counter() {
        return new Uint8Array(16)
    }

    /**
     * Listen everything in the page
     * @param ev: the event to listen
     * @param func: what to do when listen
     */
    listen(ev, func) {
        var _ob = (ev) => {
            console.log(ev)
        }

        if (ev) {
            this.el.addEventListener(ev, func || _ob)
        } else {
            [
                'click',
                'mouseover'/*,
                'mouseout',
                'drag',
                'drop',
                'DOMSubtreeModified'*/
            ].forEach((e) => {
                this.el.addEventListener(e, func || _ob)
            })
        }
    }

    /**
     * Observes everything in the current element
     * @param current: the element to be observed
     */
    observe(current) {
        var text = []
        var txt = ''
        // Check the element has no children && that it is not empty
        if (current.children.length === 0 &&
            current.textContent.replace(/ |\n\r/g, '') !== '') {

            // get it only if is not a script or code block
            if (current.outerHTML.indexOf('<script') < 0) {
                txt = current.textContent
            }
        }

        // prepare texts to classify
        var resultList = txt
            .split(/[\,\.\!\\\/\;\?\'\"\@\#\$\%\&\*\(\)\-\_\=\+\^\~\]\[\{\}\:\>\<]+/)
            .filter((val) => {
                return val.match(/([A-Za-z])\w+/g)
        })

        for (var j = 0; j < resultList.length; j++) {
            if (resultList[j].trim().length < 21) {
                text.push(resultList[j].trim())
            }
        }

        // put texts in right places
        for (var i = 0; i < text.length; i++) {
            if (text[i].split(/\s/).length > 1) {
                this._mind.vocabulary.expressions.push(text[i])
                text[i].split(/\s/).forEach((s) => {
                    this._mind.vocabulary.words.push(s)
                });
            } else {
                this._mind.vocabulary.words.push(text[i])
            }
        }
    }

    /**
     * Listen everything in the page
     * @param ev: the event to listen
     * @param func: what to do when listen
     */
    static listenAll(ev, func) {
        // get all except script and code
        var elements = document.body.getElementsByTagName('*')
        
        for(var i = 0; i < elements.length; i++) {
            var current = elements[i]
            // Check the element has no children
            if(current.children.length === 0) {
                // get it only if is not a script block
                if (current.outerHTML.indexOf('<script') < 0) {
                    current.listen(ev, func)
                }
            }
        }
    }

    /**
     * Observe all page content
     */
    observeAll() {
        // get all except script and code
        var elements = document.body.getElementsByTagName('*')
        
        for(var i = 0; i < elements.length; i++) {
            var current = elements[i]
            // Check the element has no children
            if(current.children.length === 0) {
                // get it only if is not a script block
                if (current.outerHTML.indexOf('<script') < 0) {
                    this.observe(current)
                }
            }
        }
    }

    /**
     * Try to generate new AES encryption key
     */
    initCrypt(then) {
        this._crypt.generateKey(
            this.aes_k,
            false,
            ['encrypt', 'decrypt']
        ).then((key) => {
            this._key = key
            if (then) then(key)
        })
    }

    /**
     * Encrypt data using AES encryption
     */
    encrypt(data, then) {
        if (this._key) {
            this._crypt.encrypt(
                this.aes,
                this._key,
                new Uint8Array(data)
            ).then((enc) => {
                if (then) then(enc)
            })
        } else {
            this.initCrypt((key) => {
                this._crypt.encrypt(
                    this.aes,
                    key,
                    new Uint8Array(data)
                ).then((enc) => {
                    if (then) then(enc)
                })
            })
        }
    }

    /**
     * Decrypt data using AES encryption
     */
    decrypt(data, then) {
        if (this._key) {
            this._crypt.decrypt(
                this.aes,
                this._key,
                new Uint8Array(data)
            ).then((dec) => {
                if (then) then(dec)
            })
        }
    }
}

(() => {
    // Export to container workspace
    this.Hdllr = Hdllr

    Node.prototype.listen = (ev, func) => {
        new Hdllr(this).listen(ev, func)
    }

    Node.listenAll = (func, ev) => {
        Hdllr.listenAll(ev, func)
    }
})()