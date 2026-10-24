/**
 * Autocomplete component
 */
function autocomplete(inp, arr) {
    let currentFocus;

    inp.addEventListener("input", function() {
        let val = this.value;
        closeAllLists();
        if (!val) return false;
        currentFocus = -1;

        let a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                let b = document.createElement("DIV");
                b.innerHTML = "<strong>" + capitalizeFirstLetter(arr[i].name.substr(0, val.length)) + "</strong>";
                b.innerHTML += capitalizeAfterHyphen(arr[i].name.substr(val.length));
                b.innerHTML += "<input type='hidden' value='" + capitalizeFirstLetter(arr[i].name) + "'>";
                
                b.addEventListener("click", function() {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });

    inp.addEventListener('keydown', function(e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");

        if (e.keyCode == 40) { // Down
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { // Up
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) { // Enter
            if (currentFocus > -1 && x) {
                e.preventDefault();
                x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        let x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });
}