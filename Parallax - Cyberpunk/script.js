let bg = document.getElementById("bg");
let bala = document.getElementById("bala");
let girl= document.getElementById("girl");
let text= document.getElementById("text");

window.addEventListener('scroll', function(){
	var value = this.window.scrollY;

	bg.style.top = value + 0.5 + 'px';
	bala.style.left = value + 0.5 + 'px';
	girl.style.top = value + 0.15 + 'px';
	text.style.bottom = value + 1 + 'px';
})