interface Props{

children:React.ReactNode;

}


export default function Badge({
children
}:Props){


return (

<span

className="
px-3
py-1
rounded-full
bg-green-100
text-green-700
text-xs
font-medium
"

>

{children}

</span>

)


}