(function () {
    const COLLEGES = ["Albany College of Pharmacy and Health Sciences", "Amarillo College", "American University (AU)", "Arizona State University", "Ateneo de Manila University", "Augusta University ", "Azusa Pacific University (APU)", "Berkeley Community College (BCC)", "Biola University", "Brown University", "Cal Baptist University", "Cal Poly Pomona (CPP)", "Cal Poly SLO", "Caltech", "Carnegie Mellon University (CMU)", "Case Western Reserve University ", "Century High School", "Chaffey College", "Chapman University", "Citrus College", "City College of San Francisco (CCSF)", "Claflin University ", "Claremont Colleges", "Clark University", "Clemson", "College of the Canyons", "Columbia International University ", "Concordia Irvine", "Cornell University", "Crafton Hills College", "CSU", "CSU East Bay", "CSU Fresno", "CSU Fullerton", "CSU Long Beach", "CSU Los Angeles", "CSU Monterey Bay", "CSU Northridge", "CSU Sacramento", "CSU San Bernardino", "CSU Stanislaus", "Daley", "Dallas College ", "Dartmouth", "De Anza College", "Drexel University", "Duke University", "El Camino College", "Emory", "Evergreen Valley College", "Florida State University", "Folsom Lake College", "Fordham University", "Gavilan community college", "George Fox University", "George Mason University (GMU)", "Golden West College", "Grand Canyon University", "Harvard University", "Hong Kong University", "Houston Community College", "Indiana University", "Iowa State University", "Johns Hopkins University", "Kansas City University of Medicine & Biosciences", "Laney Community College", "Leesville Road High School", "Life Pacific University", "Loma Linda University", "Loyola Marymount University (LMU)", "Loyola University Chicago", "Maryville College ", "Middlebury College", "Midwestern University", "Milwaukee Area Technical College", "Minneapolis College of Art and Design", "MIT", "Moreno Valley College", "N/A", "NC State University", "New York University", "Northern Virginia Community College", "Northwestern", "Oakland University", "Ohio State University", "Ohlone College", "One Body Church", "Oral Roberts University", "Pace University", "Penn State University", "Pepperdine University", "Point Loma Narazene University", "Prairie College", "Prince George’s Community College", "Princeton", "Purdue", "Rice University", "Rider University", "Rip Hondo College", "Riverside City College", "Rutgers", "San Diego Mesa College ", "San Diego Mesa Community College", "San Jose State University (SJSU)", "Santa Clara University", "Santa Monica College", "Savannah college of Art and Design ", "School of Visual Arts", "Seattle Pacific University", "Seattle University", "SF State University (SFSU)", "Shasta College", "Simon Fraser University", "Skyline College", "Spring Arbor University", "St. Charles Community College ", "St. Edward’s University  ", "St. Louis Community College", "Stanly Community College", "Swarthmore", "Tata Institute of Social Sciences, Mumbai, India", "Texas A&M", "Texas State, San Marcos", "Towson University", "Tsinghua University", "Tufts University", "Tulane University", "UC Berkeley", "UC Davis", "UC Irvine (UCI)", "UC Merced", "UC Riverside (UCR)", "UC San Diego (UCSD)", "UC Santa Barbara (UCSB)", "UC Santa Cruz (UCSC)", "UCLA", "UMD Baltimore County", "UMD College Park", "UNC Chapel Hill", "United States Air Force Academy ", "United States Naval School", "Unites States Military Academy at West Point", "University of British Columbia", "University of Campinas", "University of Chicago", "University of Hawai'i at Manoa", "University of Houston", "University of Minnesota", "University of North Georgia", "University of Pennsylvania (UPenn)", "University of Pittsburgh", "University of San Francisco (USF)", "University of the Pacific (UoP)", "University of Utah", "University of Virginia", "University of Washington (UW)", "University of Wisconsin Madison", "Universty of Illinois Urbana-Champaign", "Unnamed Community College", "USC", "UT Austin", "UT Dallas", "UT Tyler", "Victor Valley College", "Virginia tech ", "Wake Tech", "Wellesley College", "Western Washington University", "Westmont", "Wheaton", "William Jessup University", "Other"];
    const PROMPTS = ["What did you get from this retreat?", "How did you connect with the characters of the stories?", "How did the gospel become more clear to you during this retreat?", "What was/is your view of Jesus before and after this retreat?"];
    const API_ENDPOINT = "https://l0642dodf0.execute-api.us-east-1.amazonaws.com/default/getPresignedURL";
    document.addEventListener("DOMContentLoaded", OnLoad);

    function OnLoad() {
        ShowPage($("button").first(), "vb-page-1");
        SetupPrompts();
        SetupButtons();
        SetupCollegesSelector();
        SetupVideoRecording();
    }

    function SetupPrompts() {
        let $prompts = $("#prompts");
        AppendMdcListItems($prompts, PROMPTS);

        console.log($prompts.children().length)
        $prompts.children("li.mdc-list-item").on('click', (e) => {
            $("li.mdc-list-item").removeClass("selected").removeAttr('aria-selected');
            $(e.target).closest('li').addClass('selected').attr('aria-selected', true);

            $("#record-prompt-title").text(GetPromptText($(e.target)));
        });
    }

    function SetupCollegesSelector() {
        let $schoolList = $("#vb-school-list");
        AppendMdcListItems($schoolList, COLLEGES);
    }

    function AppendMdcListItems($parent, textArray) {
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
                if (iC < 65 || iC > 127 || (iC>90 && iC<97)) {
                    aRet[i] = '&#'+iC+';';
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
        })
    }

    function ShowPage($el, pageId) {
        $el.closest('.video-booth-page').fadeOut(150, () => {
            $("#" + pageId).fadeIn(150);
        });
    }

    function SetupVideoRecording() {
        const RECORD_INTERVAL = 500;

        let shouldStop, stopped;
        const downloadLink = document.getElementById("download");
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
                $("#vb-3-back").prop('disabled', true);
                $("#submit").prop('disabled', true);

                shouldStop = stopped = false;
                recordedChunks = [];
            });

            $("#submit").on('click', () => {
                let fileName = GetUserFileName();
                console.log(fileName);
                Upload(new Blob(recordedChunks), fileName);
            })

            mediaRecorder.addEventListener("dataavailable", e => {

                if (e.data.size > 0)
                    recordedChunks.push(e.data);

                if (shouldStop === true && stopped === false) {
                    mediaRecorder.stop();
                    stopped = true;

                    $("#start").prop('disabled', false);
                    $("#stop").prop('disabled', true);
                    $("#vb-3-back").prop('disabled', false);
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
        if(typeof $el === "undefined")
            $el = $("#vb-page-1 .mdc-list-item.selected");
        return $el.text().trim();
    }

    async function Upload(file, name) {
        try {
            var response = await fetch(API_ENDPOINT + "?name=" + name);
            var data = await response.json();

            UploadToUrl(data.uploadURL, file);
        } catch (e) {
            console.error(e);
        }
    }

    async function UploadToUrl(url, file) {
        try {
            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'video/webm'
                },
                mode: 'cors',
                body: file
            });
        } catch (e) {
            console.error(e);
        }
    }
})();