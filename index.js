(function () {
    const COLLEGES = ["Albany College of Pharmacy and Health Sciences", "Amarillo College", "American University (AU)", "Arizona State University", "Ateneo de Manila University", "Augusta University ", "Azusa Pacific University (APU)", "Berkeley Community College (BCC)", "Biola University", "Brown University", "Cal Baptist University", "Cal Poly Pomona (CPP)", "Cal Poly SLO", "Caltech", "Carnegie Mellon University (CMU)", "Case Western Reserve University ", "Century High School", "Chaffey College", "Chapman University", "Citrus College", "City College of San Francisco (CCSF)", "Claflin University ", "Claremont Colleges", "Clark University", "Clemson", "College of the Canyons", "Columbia International University ", "Concordia Irvine", "Cornell University", "Crafton Hills College", "CSU", "CSU East Bay", "CSU Fresno", "CSU Fullerton", "CSU Long Beach", "CSU Los Angeles", "CSU Monterey Bay", "CSU Northridge", "CSU Sacramento", "CSU San Bernardino", "CSU Stanislaus", "Daley", "Dallas College ", "Dartmouth", "De Anza College", "Drexel University", "Duke University", "El Camino College", "Emory", "Evergreen Valley College", "Florida State University", "Folsom Lake College", "Fordham University", "Gavilan community college", "George Fox University", "George Mason University (GMU)", "Golden West College", "Grand Canyon University", "Harvard University", "Hong Kong University", "Houston Community College", "Indiana University", "Iowa State University", "Johns Hopkins University", "Kansas City University of Medicine & Biosciences", "Laney Community College", "Leesville Road High School", "Life Pacific University", "Loma Linda University", "Loyola Marymount University (LMU)", "Loyola University Chicago", "Maryville College ", "Middlebury College", "Midwestern University", "Milwaukee Area Technical College", "Minneapolis College of Art and Design", "MIT", "Moreno Valley College", "N/A", "NC State University", "New York University", "Northern Virginia Community College", "Northwestern", "Oakland University", "Ohio State University", "Ohlone College", "One Body Church", "Oral Roberts University", "Pace University", "Penn State University", "Pepperdine University", "Point Loma Narazene University", "Prairie College", "Prince George’s Community College", "Princeton", "Purdue", "Rice University", "Rider University", "Rip Hondo College", "Riverside City College", "Rutgers", "San Diego Mesa College ", "San Diego Mesa Community College", "San Jose State University (SJSU)", "Santa Clara University", "Santa Monica College", "Savannah college of Art and Design ", "School of Visual Arts", "Seattle Pacific University", "Seattle University", "SF State University (SFSU)", "Shasta College", "Simon Fraser University", "Skyline College", "Spring Arbor University", "St. Charles Community College ", "St. Edward’s University  ", "St. Louis Community College", "Stanly Community College", "Swarthmore", "Tata Institute of Social Sciences, Mumbai, India", "Texas A&M", "Texas State, San Marcos", "Towson University", "Tsinghua University", "Tufts University", "Tulane University", "UC Berkeley", "UC Davis", "UC Irvine (UCI)", "UC Merced", "UC Riverside (UCR)", "UC San Diego (UCSD)", "UC Santa Barbara (UCSB)", "UC Santa Cruz (UCSC)", "UCLA", "UMD Baltimore County", "UMD College Park", "UNC Chapel Hill", "United States Air Force Academy ", "United States Naval School", "Unites States Military Academy at West Point", "University of British Columbia", "University of Campinas", "University of Chicago", "University of Hawai'i at Manoa", "University of Houston", "University of Minnesota", "University of North Georgia", "University of Pennsylvania (UPenn)", "University of Pittsburgh", "University of San Francisco (USF)", "University of the Pacific (UoP)", "University of Utah", "University of Virginia", "University of Washington (UW)", "University of Wisconsin Madison", "Universty of Illinois Urbana-Champaign", "Unnamed Community College", "USC", "UT Austin", "UT Dallas", "UT Tyler", "Victor Valley College", "Virginia tech ", "Wake Tech", "Wellesley College", "Western Washington University", "Westmont", "Wheaton", "William Jessup University", "Other"];
    const PROMPTS = ["What was challenging, surprising or inspiring from RISE so far?", "What's a vision you would like to see happen at your campus?", "Send a shout out or share what you are most thankful for from this retreat.", "What was most memorable about Rise 2020?"];
    const API_ENDPOINT = "https://l0642dodf0.execute-api.us-east-1.amazonaws.com/default/getPresignedURL";
 
    let VIDEO_IS_SETUP = false;

    document.addEventListener("DOMContentLoaded", OnLoad);

    function OnLoad() {
        SetupMDCElements();
        ShowPage($("button").first(), "vb-page-1");
        SetupPrompts();
        SetupButtons();
        SetupCollegesSelector();
        SetupBrowserWarning();
    }

    function SetupMDCElements() {
        for (el of document.querySelectorAll('.mdc-text-field'))
            new mdc.textField.MDCTextField(el);

        for (el of document.querySelectorAll('.mdc-select')) {
            new mdc.select.MDCSelect(el);
        }
    }

    function SetupBrowserWarning() {
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
        var isIE = /*@cc_on!@*/false || !!document.documentMode;

        if (isSafari || isIE) {
            $("#record-page-button").prop('disabled', true);
            setTimeout(() => {
                $("#browser-warning").fadeIn(500)
            }, 1000);
        }
    }

    function SetupPrompts() {
        let $prompts = $("#prompts");
        AppendMDCListItems($prompts, PROMPTS);

        $prompts.children("li.mdc-list-item").on('click', (e) => {
            $("li.mdc-list-item").removeClass("selected").removeAttr('aria-selected');
            $(e.target).closest('li').addClass('selected').attr('aria-selected', true);

            $("#record-prompt-title").text(GetPromptText($(e.target)));
        });
    }

    function SetupCollegesSelector() {
        let $schoolList = $("#vb-school-list");
        AppendMDCListItems($schoolList, COLLEGES);
    }

    function AppendMDCListItems($parent, textArray) {
        for (text of textArray) {
            let safeText = HTMLEncode(text);
            $parent.append($(`<li class="mdc-list-item" data-value="${safeText}">
                <span class="mdc-list-item__ripple"></span>
                <span class="mdc-list-item__text">${safeText}</span>
            </li>`));
        }

        function HTMLEncode(str) {
            var i = str.length,
                aRet = [];

            while (i--) {
                var iC = str[i].charCodeAt();
                if (iC < 65 || iC > 127 || (iC > 90 && iC < 97)) {
                    aRet[i] = '&#' + iC + ';';
                } else {
                    aRet[i] = str[i];
                }
            }
            return aRet.join('');
        }
    }

    function SetupButtons() {
        $(".mdc-button").on('click', (e) => {
            let $target = $(e.target).closest('button');
            let pageId = $target.attr('vbnav');

            if (pageId === "vb-page-2" || pageId === "vb-page-3") {
                let fileName = GetUserFileName();
                if (!fileName) {
                    alert("Please fill out form completely");
                    return;
                }
            }

            if (pageId) {
                ShowPage($target, pageId);
            }
        });

        const $vb2DefButtons = $(".button-container.vb-3-buttons");
        const $uploadContainer = $("#upload-container");
        $("#open-upload-button").on("click", () => {
            $vb2DefButtons.fadeOut(150, () => {
                $uploadContainer.fadeIn(150);
            });
        });

        $("#upload-container .cancel-button").on("click", () => {
            $uploadContainer.fadeOut(150, () => {
                $vb2DefButtons.fadeIn(150);
            });
        });

        const $fileChooser = $("#upload-file-chooser");
        const $uploadButton = $("#upload-button");
        $("#choose-file-button").on("click", () => {
            $fileChooser.click();
        });

        $fileChooser.on('change', () => {
            if(!$fileChooser.val())
                return;

            let text = $fileChooser.val().split("\\").pop(); // get the file name
            $("#choose-file-name").text(text)
            $uploadButton.prop("disabled", false);
        });

        $uploadButton.on('click', () => {
            let file = $fileChooser[0].files[0];

            if(!file) {
                console.error('Something went wrong: file is not there.');
                return;
            }

            Upload(file, file.type, GetExtension(file.name));

            function GetExtension(filename) {
                return filename.split('.').pop();
            }
        });
    }

    function ShowPage($el, pageId) {
        if (pageId === "vb-page-2" && !VIDEO_IS_SETUP) {
            SetupVideoRecording();
            VIDEO_IS_SETUP = true;
        }

        $el.closest('.video-booth-page').fadeOut(150, () => {
            $("#" + pageId).fadeIn(150);
        });
    }

    function OnUploaded() {
        $("#vb-progress-title").text("Thanks for sharing!");
        $("#vb-progress-done-p").css('display', 'block');
        $(".mdc-linear-progress").css('display', "none");
    }

    function SetupVideoRecording() {
        const RECORD_INTERVAL = 500;

        let shouldStop, stopped;
        const startButton = document.getElementById("start");
        const stopButton = document.getElementById("stop");
        const player = document.getElementById("player");

        stopButton.addEventListener("click", function () {
            shouldStop = true;
        });

        var handleSuccess = function (stream) {
            player.srcObject = stream;
            player.muted = true;
            player.play();

            const options = { mimeType: "video/webm" };
            let mediaRecorder = new MediaRecorder(stream, options);
            let recordedChunks

            startButton.addEventListener("click", () => {
                ShowVideoCountdown(() => {
                    mediaRecorder.start(RECORD_INTERVAL);
                    $("#stop").prop('disabled', false);
                });
                $("#start").prop('disabled', true);
                $("#vb-2-back").prop('disabled', true);
                $("#submit").prop('disabled', true);

                shouldStop = stopped = false;
                recordedChunks = [];
            });

            $("#submit").on('click', () => {
                Upload(new Blob(recordedChunks));
            })

            mediaRecorder.addEventListener("dataavailable", e => {
                if (e.data.size > 0)
                    recordedChunks.push(e.data);

                if (shouldStop === true && stopped === false) {
                    mediaRecorder.stop();
                    stopped = true;

                    $("#start").prop('disabled', false);
                    $("#stop").prop('disabled', true);
                    $("#vb-2-back").prop('disabled', false);
                    $("#submit").prop('disabled', false);
                }
            });

            mediaRecorder.addEventListener("stop", () => {
            });
        };

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then(handleSuccess);
    }

    function ShowVideoCountdown(callback) {
        let secondsLeft = 5;
        let overlay = document.getElementById("player-overlay");
        overlay.style.display = "block";
        overlay.textContent = secondsLeft;

        decrementTime();

        function decrementTime() {
            setTimeout(() => {
                secondsLeft--;
                if (secondsLeft < 0) {
                    overlay.style.display = "none";
                    callback();
                } else {
                    decrementTime();
                }

                overlay.textContent = secondsLeft;
            }, 1000)
        }
    }

    function GetUserFileName() {
        let prompt = GetPromptText();

        let fName = $("#fname").val();
        let lName = $("#lname").val();
        let year = $("#year").text();
        let sName = $("#sname").text();

        if (!fName || !lName || !year || !sName)
            return null;

        return prompt + "/" + sName + "/" + year + "/" + fName + lName;
    }

    function GetPromptText($el) {
        if (typeof $el === "undefined")
            $el = $("#vb-page-1 .mdc-list-item.selected");
        return $el.text().trim();
    }

    async function Upload(blob, contentType, extension) {
        const name = GetUserFileName();

        const nameParam = "?name=" + encodeURIComponent(name);
        const contentParam = contentType ? "&ctype=" + encodeURIComponent(contentType) : "";
        const extensionParam = contentType && extension ? "&ext=" + encodeURIComponent(extension) : "";

        try {
            var response = await fetch(API_ENDPOINT + nameParam + contentParam + extensionParam);
            var data = await response.json();

            UploadToUrl(data.uploadURL, blob, contentType);
        } catch (e) {
            console.error(e);
        }
    }

    async function UploadToUrl(url, blob, contentType) {
        if(typeof contentType === "undefined")
            contentType = "video/webm";

        try {
            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': contentType
                },
                mode: 'cors',
                body: blob
            });

            OnUploaded();
        } catch (e) {
            console.error(e);
        }
    }
})();