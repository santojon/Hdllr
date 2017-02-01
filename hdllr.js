/**
 * Class responsible to listen, observe and secure the page
 */
class Hdllr {
    /**
     * Instantiate a new Hdllr
     */
    constructor(el, crypt) {
        this.el = el
        this._mind = {
            vocabulary: {
                words: [],
                expressions: []
            }
        }
        this.crypt = crypt || window.crypto
        this._crypt = crypt.subtle

        this.aes = {
            name: "AES-GCM",
            iv: crypt.getRandomValues(new Uint8Array(12)),
            additionalData: ArrayBuffer,
            tagLength: 128
        }
        this.aes_k = {
            name: "AES-GCM",
            length: 256
        }
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
     * Observes everything in the page
     * @param ev: the event to observe
     * @param func: what to do when observe
     */
    observe(ev, func) {
        this.listen(ev, func || ((ev) => {
            var text = []
            var allTxt = []
            var current = ev.target
            // Check the element has no children && that it is not empty
            if (current.children.length === 0 &&
                current.textContent.replace(/ |\n\r/g, '') !== '') {

                // get it only if is not a script or code block
                if (current.outerHTML.indexOf('<script') < 0) {
                    var txt = current.textContent
                    allTxt.push(txt)
                }
            }

            // prepare texts to classify
            for (i = 0; i < allTxt.length; i++) {
                var resultList = allTxt[i]
                    .split(/[\,\.\!\\\/\;\?\'\"\@\#\$\%\&\*\(\)\-\_\=\+\^\~\]\[\{\}\:\>\<]+/)
                    .filter(function (val) {
                        return val.match(/([A-Za-z])\w+/g)
                    })

                for (j = 0; j < resultList.length; j++) {
                    if (resultList[j].trim().length < 21) {
                        text.push(resultList[j].trim())
                    }
                }
            }

            // put texts in right places
            for (i = 0; i < text.length; i++) {
                if (text[i].split(/\s/).length > 1) {
                    this._mind.vocabulary.expressions.push(text[i])
                    text[i].split(/\s/).forEach(function (s) {
                        this._mind.vocabulary.words.push(s)
                    });
                } else {
                    this._mind.vocabulary.words.push(text[i])
                }
            }
        }))
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
    static observeAll() {
        // get all except script and code
        var elements = document.body.getElementsByTagName('*')
        
        for(var i = 0; i < elements.length; i++) {
            var current = elements[i]
            // Check the element has no children
            if(current.children.length === 0) {
                // get it only if is not a script block
                if (current.outerHTML.indexOf('<script') < 0) {
                    current.observe(ev, func)
                }
            }
        }
    }

    /**
     * Generate new AES encryption key
     */
    initAes() {
        return _crypt.generateKey(this.aes_k, true, ["encrypt", "decrypt"])
    }

    /**
     * Encrypt data using AES encryption
     */
    aesCrypt(data) {
        return
    }
}

(() => {
    Node.prototype.listen = (ev, func) => {
        new Hdllr(this).listen(ev, func)
    }

    Node.prototype.observe = (ev, func) => {
        new Hdllr(this).observe(ev, func)
    }

    Node.listenAll = (func, ev) => {
        Hdllr.listenAll(ev, func)
    }

    Node.observeAll = (func, ev) => {
        Hdllr.observeAll(ev, func)
    }
})()

var _crypt = crypto.subtle;

var crypt_alg = {
    name: "AES-CTR",
    //Don't re-use counters!
    //Always use a new counter every time your encrypt!
    counter: new Uint8Array(16),
    length: 128, //can be 1-128
};
var crypt_alg_k = {
    name: "AES-CTR",
    length: 256, //can be  128, 192, or 256
};

var _aes_key_data;

var enc_data;
var data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

console.log(new Hdllr().initAes().then(function(key){
                console.log(key);
            }));

_crypt.generateKey(
    crypt_alg_k,
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
)
.then(function(key){
    //returns a key object
    console.log(key);

    _crypt.exportKey(
        "jwk", //can be "jwk" or "raw"
        key //extractable must be true
    )
    .then(function(keydata){
        //returns the exported key data
        _aes_key_data = keydata;
        console.log(keydata);
    })
    .catch(function(err){
        console.error(err);
    });

    _crypt.encrypt(
        crypt_alg,
        key, //from generateKey or importKey above
        new Uint8Array(data) //ArrayBuffer of data you want to encrypt
    )
    .then(function(encrypted){
        //returns an ArrayBuffer containing the encrypted data
        console.log(new Uint8Array(encrypted));
        enc_data = new Uint8Array(encrypted);

        _crypt.importKey(
            "jwk", //can be "jwk" or "raw"
            _aes_key_data,
            crypt_alg_k,
            true, //whether the key is extractable (i.e. can be used in exportKey)
            ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
        )
        .then(function(key){
            //returns the symmetric key
            console.log(key);

            _crypt.decrypt(
                crypt_alg,
                key, //from generateKey or importKey above
                new Uint8Array(enc_data) //ArrayBuffer of the data
            )
            .then(function(decrypted){
                //returns an ArrayBuffer containing the decrypted data
                console.log(new Uint8Array(decrypted));
            })
            .catch(function(err){
                console.error(err);
            });
        })
        .catch(function(err){
            console.error(err);
        });
    })
    .catch(function(err){
        console.error(err);
    });
})
.catch(function(err){
    console.error(err);
});