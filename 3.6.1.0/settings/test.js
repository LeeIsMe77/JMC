function Test(newFunction){
    this.NewFuncion = newFunction;
}

var test = new Test(
    function(){
        return "false";
    }
)
jmc.ShowMe(test.NewFuncion());