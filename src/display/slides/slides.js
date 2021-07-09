const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

socket.on("set-state", newState => {
    let old_state = display_state;
    display_state = JSON.parse(newState);

    if ((old_state.slides != display_state.slides) || (old_state.curr_slide != display_state.curr_slide)){
        show_slide(display_state.slides[display_state.curr_slide], window.location.pathname == "/slides-chroma");
    }

    // this stuff should only happen on the chroma display
    if (window.location.pathname == "/slides-chroma"){
        if (old_state.chroma_color != display_state.chroma_color){
            document.querySelector("body").style.backgroundColor = display_state.chroma_color;
        }
    }
});

function show_slide(slide, chroma){
    let tmp = "";
    switch (slide.slide_type){
        case "speaker":
            if (chroma){
                let line2 = ""
                if (slide.title=="" || slide.company==""){
                    line2 = `${slide.title}${slide.company}`;
                }
                else{
                    line2 = `${slide.title}, ${slide.company}`;
                }
                tmp = `<div class="slide-name">${slide.name}</div><div>${line2}</div>`
            }
            else{
                tmp = `<div class="slide-name">${slide.name}</div><div><em>${slide.title}</em></div><div>${slide.company}</div>`;
            }
        break;
        case "award-intro":
            tmp = `<div class="slide-name">${slide.award_name}</div><p class="award-desc">${slide.desc}</p>`;
        break;
        case "award-winner":
            tmp = `<div class="slide-name">${slide.award_name}</div><div><strong>${slide.team_num}</strong> – ${slide.team_name}</div><div><em>${slide.team_loc}</em></slide>`
        break;
        case "text":
            tmp = slide.slide_text;
        break;
    }
    document.querySelector("#slides-disp").innerHTML = tmp;
}