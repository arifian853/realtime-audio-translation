
import { US, ID, JP, KR, CN } from 'country-flag-icons/react/3x2'
import { FaMicrophone } from "react-icons/fa6";
import { useState } from "react"
import { MdExpandMore } from "react-icons/md";
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuRadioItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup
} from "@/components/ui/dropdown-menu"

export const SpeakBtnA = () => {
    const [language, setLanguage] = useState("Indonesia")

    return (
        <div className='text-center p-2'>
            <div className="flex gap-1 justify-center items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className='w-24' variant="link"> <span className='md:text-xl text-md'><MdExpandMore /></span> <span className='md:text-md text-sm'>{language}</span>  </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Choose Language</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                            <DropdownMenuRadioItem className='flex gap-2 items-center' value="Indonesia">Indonesia <ID title="Indonesia" className='w-6 h-4' /></DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className='flex gap-2 items-center' value="English">English (US) <US title="United States" className='w-6 h-4' /></DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className='flex gap-2 items-center' value="Japan">Japan <JP title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className='flex gap-2 items-center' value="Korea">Korea <KR title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                            <DropdownMenuRadioItem className='flex gap-2 items-center' value="Chinese">Chinese <CN title="Japan" className='w-6 h-4' /></DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <button className='md:w-[80px] w-[60px] md:h-[80px] h-[60px] rounded-full bg-[#090C9B]'>
                    <span className='md:text-3xl text-2xl text-white flex justify-center items-center'>
                        <FaMicrophone />
                    </span>
                </button>
            </div>
            <br />
            <span className='text-sm'>Tahan untuk bicara</span>
        </div>
    )
}
