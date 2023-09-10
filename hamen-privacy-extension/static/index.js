window.addEventListener("load", () => {
    let keyCode = document.querySelector(".key-code>.keys");
    let inputs = Array.from(keyCode.children);

    const checkLoggedIn = () => {
        chrome.storage.local.get("hamen.privacy_extension.is_logged_in", response => {
            if (response["hamen.privacy_extension.is_logged_in"] === "true") {
                document.querySelector(".key-code").style.display = "none";
                document.querySelector(".control-panel").style.display = "flex";
            } else {
                document.querySelector(".key-code").style.display = "flex";
                document.querySelector(".control-panel").style.display = "none";
            }
        });
    }    

    setInterval(() => {
        checkLoggedIn();
    }, 5)

    const keyValue = () => {
        return inputs.map(elem => { return elem.value || "X"; }).join("")
    }

    const signOut = () => {
        return new Promise((resolve, reject) => {
            document.querySelector(".key-code .error").classList.remove("visible");
            document.querySelector(".control-panel").style.display = "none";
            document.querySelector(".key-code").style.display = "flex";

            chrome.storage.local.set({ "hamen.privacy_extension.is_logged_in": "false" }, function() {
                resolve();
            });
        });
    }

    document.querySelector("#sign-out").addEventListener("click", () => { signOut(); });

    const clearKeys = () => {
        Array.from(document.querySelectorAll(".keys>input")).forEach(input => {
            input.value = "";
        })
    }

    const selectFirstInput = () => {
        let first = Array.from(document.querySelectorAll(".keys>input"))[0];
        first.focus();
        first.select();
    }

    const sendError = (key) => {
        // let req = new XMLHttpRequest();
    
        // req.open("GET", "https://api.hamen.io/hamen/privacy-extension/send_error.php?key=" + key, true);
    
        // req.onreadystatechange = function () {
        //     if (req.readyState === XMLHttpRequest.DONE) {
        //         if (req.status === 200) {
        //             // Nothing for now...
        //         } else {
        //             console.error("Hamen Error: could not send the error report; status: " + req.status);
        //         }
        //     }
        // };
    
        // req.send();
    };

    const setError = (message) => {
        return new Promise((resolve, reject) => {
            let error = document.querySelector(".key-code .error");
            error.classList.add("visible");
            error.innerText = message;

            resolve(() => {
                error.classList.remove("visible");
            });
        })
    };

    const validateKeyCode = () => {
        let req = new XMLHttpRequest();

        req.open("GET", "https://api.hamen.io/privacy-extension/check-key/index.php?key=" + keyValue(), false);
        req.send(null);

        if (req.responseText === "KEY_CORRECT") {
            chrome.storage.local.set({ "hamen.privacy_extension.is_logged_in": "true" }, function() {
                document.querySelector(".control-panel").style.display = "flex";
                document.querySelector(".key-code").style.display = "none";
    
                clearKeys();
            });
        } else {
            sendError(keyValue());

            clearKeys();
            selectFirstInput();

            setError(req.responseText).then((hideError) => {
                setTimeout(() => {
                    hideError();
                }, 10_000);
            });
        }
    }

    window.addEventListener("keydown", e => {
        if (e.key === "c") {
            clearKeys();
            selectFirstInput();
        } else if (e.key === "s") {
            signOut();
        }
    })

    document.querySelector("#authorize").addEventListener("click", () => { validateKeyCode(); });

    inputs.forEach((input, i) => {
        input.addEventListener("keydown", e => {
            if (e.key === "Backspace") {
                if (input.value === "") {
                    e.preventDefault();
                    inputs[i - 1]?.focus();
                    inputs[i - 1]?.select();
                }
            } else if (e.key === "ArrowLeft") {
                inputs[i - 1]?.focus();
                inputs[i - 1]?.select();
                e.preventDefault();
            } else if (e.key === "ArrowRight") {
                inputs[i + 1]?.focus();
                inputs[i + 1]?.select();
                e.preventDefault();
            } else if (e.key === "Enter") {
                validateKeyCode();
            } else if (e.key === "c") {
                clearKeys();
                selectFirstInput();
            } else {
                e.preventDefault();

                if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(elem => { return elem.toString() }).includes(e.key)) {
                    inputs[i + 1]?.focus();
                    inputs[i + 1]?.select();
                    input.value = e.key;
                }
            }
        })
    })
})