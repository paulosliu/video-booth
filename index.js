(function () {
    const API_ENDPOINT = "https://l0642dodf0.execute-api.us-east-1.amazonaws.com/default/getPresignedURL";
    $(OnLoad);

    function OnLoad() {
        SetupVideoRecording();
    }

    function SetupVideoRecording() {
        const RECORD_INTERVAL = 500;

        let shouldStop = false;
        let stopped = false;
        const downloadLink = document.getElementById("download");
        const startButton = document.getElementById("start");
        const stopButton = document.getElementById("stop");
        const player = document.getElementById("player");

        stopButton.addEventListener("click", function () {
            shouldStop = true;
            $('#download').css("display", "block");
        });

        var handleSuccess = function (stream) {
            player.srcObject = stream;
            player.muted = true;
            player.play();

            const options = { mimeType: "video/webm" };
            const recordedChunks = [];
            const mediaRecorder = new MediaRecorder(stream, options);

            startButton.addEventListener("click", () => {
                mediaRecorder.start(RECORD_INTERVAL);
            });

            mediaRecorder.addEventListener("dataavailable", e => {

                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }

                if (shouldStop === true && stopped === false) {
                    mediaRecorder.stop();
                    stopped = true;
                }
            });

            mediaRecorder.addEventListener("stop", () => {
                downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
                downloadLink.download = GetUserFileName();

                Upload(new Blob(recordedChunks), GetUserFileName());
            });
        };

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then(handleSuccess);
    }

    function GetUserFileName() {
        let fName = $('#fname').val();
        let lName = $('#lname').val();
        let year = $('#year').val();
        let sName = $('#sname').val();

        return fName + lName + "_" + year + "_" + sName + ".webm";
    }

    function GetValidatedValue($el) {
        let value = $el.val();
        if (!value) {
            alert('Form must be fully filled out');
        }
        return value;
    }

    async function Upload(file, name) {
        try {
            var response = await fetch(API_ENDPOINT);
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
