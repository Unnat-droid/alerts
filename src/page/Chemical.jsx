/** @format */

import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import entvin_logo from "../assets/logo-color.png";
import useResizeObserver from "use-resize-observer";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/gh/Sayo1305/pdf-react-js/pdf.worker.mjs`;
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@mui/material";

function PDFViewer({
   url,
   scrollRef,
   onLoadSuccess,
   numPages,
   setNumPages,
   currentPage,
   setCurrentPage,
   type,
   setHighestPageNumber,
   highestPageNumber,
}) {
   const observerRef = useRef(null);
   const [scale, setScale] = useState(1); // default scale value

   function onDocumentLoadSuccess({ numPages }) {
      setNumPages(numPages);
      setHighestPageNumber((prevHighest) => Math.max(prevHighest, numPages));
      onLoadSuccess();
   }

   // Function to adjust scale based on screen height
   const adjustScale = () => {
      const height = window.innerHeight;
      if (height >= 1440) {
         setScale(1.4);
      } else if (height <= 1440 && height >= 1200) {
         setScale(1.2);
      } else if (height <= 1200 && height >= 1100) {
         setScale(1);
      } else if (height <= 1100 && height >= 1000) {
         setScale(0.9);
      } else if (height <= 1000 && height >= 900) {
         setScale(0.8);
      } else if (height <= 900 && height >= 800) {
         setScale(0.78);
      } else if (height <= 800 && height >= 700) {
         setScale(0.75);
      } else if (height <= 700 && height >= 600) {
         setScale(0.7);
      } else if (height <= 600 && height >= 500) {
         setScale(0.65);
      } else if (height <= 500 && height >= 400) {
         setScale(0.6);
      }
   };

   const { ref, width = 1, height = 1 } = useResizeObserver();

   function setupIntersectionObserver(setCurrentPage, type) {
      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  const pageNumber = parseInt(entry.target.id.split("_")[1]);
                  setCurrentPage(pageNumber);
               }
            });
         },
         { threshold: 0.3 } // Trigger when 50% of the element is visible
      );

      return observer;
   }

   useEffect(() => {
      // Adjust scale on component mount and when the window is resized
      adjustScale();

      // Listen to window resize event to adjust scale dynamically
      window.addEventListener("resize", adjustScale);

      return () => {
         window.removeEventListener("resize", adjustScale);
      };
   }, []);

   useEffect(() => {
      observerRef.current = setupIntersectionObserver(setCurrentPage, type);

      return () => {
         if (observerRef.current) {
            observerRef.current.disconnect();
         }
      };
   }, [setCurrentPage, type]);

   useEffect(() => {
      const pages = document.querySelectorAll(`[id^="page_"][id$="_${type}"]`);
      pages.forEach((page) => {
         observerRef.current.observe(page);
      });
   }, [numPages, type]);

   return (
      <div
         ref={scrollRef}
         className="w-full"
         style={{ height: "100%", overflow: "auto" }}
      >
         <div
            className="w-full h-full flex flex-col gap-5"
            ref={ref}
         >
            <Document
               file={url}
               onLoadSuccess={onDocumentLoadSuccess}
               className={"!w-full "}
            >
               {Array.from(new Array(numPages), (el, index) => (
                  <div
                     className="!w-full"
                     id={`page_${index + 1}_${type}`}
                     key={`page_${index + 1}`}
                  >
                     <Page
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        pageIndex={index}
                        // width={width}
                        className={"pb-10 !w-full"}
                        // scale={1}
                     />
                  </div>
               ))}
            </Document>
         </div>
      </div>
   );
}

const ChemicalChangePage = () => {
   let { application } = useParams();
   const location = useLocation();
   const searchParams = new URLSearchParams(location.search);
   const data_updated = searchParams.get("date");
   const [currentPage, setCurrentPage] = useState(1);
   const navigate = useNavigate();
   const [numPages, setNumPages] = useState(null);
   const [pdfLoaded, setPdfLoaded] = useState(false);
   const pdf1Ref = useRef(null);
   const pdf2Ref = useRef(null);
   const [isLoaded, setIsLoaded] = useState(false);
   const [loadedCount, setLoadedCount] = useState(0);
   const [OldPdfUrl, setOldPdfUrl] = useState("");
   const [NewPdfUrl, setNewPdfUrl] = useState("");
   const [sectionChanges, setSectionChanges] = useState([]);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [highestPageNumber, setHighestPageNumber] = useState(0);

   const goToNextChange = () => {
      const nextChange = sectionChanges.find(change => change.page > currentPage);
      if (nextChange) {
        setCurrentPage(nextChange.page);
        setCurrentIndex(sectionChanges.indexOf(nextChange));
        scrollToPage(nextChange.page);
      }
    };
    
    const goToPreviousChange = () => {
      const previousChanges = sectionChanges.filter(change => change.page < currentPage);
      if (previousChanges.length > 0) {
        const nearestPreviousChange = previousChanges[previousChanges.length - 1];
        setCurrentPage(nearestPreviousChange.page);
        setCurrentIndex(sectionChanges.indexOf(nearestPreviousChange));
        scrollToPage(nearestPreviousChange.page);
      }
    };

    const handle_fetch = async () => {
      try {
         const res = await fetch(
            `${import.meta.env.VITE_API_URL}/get_data/${application}?date_updated=${data_updated}`,
            {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyaXNoYWJoQGVudHZpbi5jb20iLCJleHAiOjE3MjY1ODkwODN9.D2CpCLzMZXm72F8v-WYPB1EphlqPWXAqKxurYphEKiQ'}`,
                  mode: "no-cors",
               },
            }
         );
         if (res.ok) {
            const data = await res.json();
            setOldPdfUrl(data?.html_content?.old_pdf_link);
            setNewPdfUrl(data?.html_content?.new_pdf_link);
            setSectionChanges(data?.sections);
         }
      } catch (err) {
         console.error(err);
      }
   };

   useEffect(() => {
      if (OldPdfUrl === "") {
         handle_fetch();
      }
   }, []);

   const handleLoadSuccess = () => {
      setLoadedCount((prev) => prev + 1);
   };

   useEffect(() => {
      if (loadedCount === 2) {
         setIsLoaded(true);
         setPdfLoaded(true);
      }
   }, [loadedCount]);

   const scrollToPage = (pageNumber) => {
      const element1 = document.getElementById(`page_${pageNumber}_new`);
      const element2 = document.getElementById(`page_${pageNumber}_old`);

      if (element1 && pdf1Ref.current) {
         element1.scrollIntoView();
      }

      if (element2 && pdf2Ref.current) {
         setTimeout(() => {
            element2.scrollIntoView();
         }, 1);
      }
      setCurrentPage(pageNumber);
   };

   // useEffect(() => {
   //    if (pdfLoaded) {
   //       scrollToPage(currentPage);
   //    }
   // }, [currentPage, pdfLoaded]);

   useEffect(() => {
      if (loadedCount === 2) {
         setIsLoaded(true);
         setPdfLoaded(true);
      }
   }, [loadedCount]);

   useEffect(() => {
      if (!isLoaded) return;

      const syncScroll = (event) => {
         const scrollingElement = event.target;
         const scrollTop = scrollingElement.scrollTop;
         const scrollLeft = scrollingElement.scrollLeft;

         if (scrollingElement === pdf1Ref.current) {
            if (pdf2Ref.current) {
               pdf2Ref.current.scrollTop = scrollTop;
               pdf2Ref.current.scrollLeft = scrollLeft;
            }
         } else if (scrollingElement === pdf2Ref.current) {
            if (pdf1Ref.current) {
               pdf1Ref.current.scrollTop = scrollTop;
               pdf1Ref.current.scrollLeft = scrollLeft;
            }
         }
      };

      const pdf1Element = pdf1Ref.current;
      const pdf2Element = pdf2Ref.current;

      if (pdf1Element) pdf1Element.addEventListener("scroll", syncScroll);
      if (pdf2Element) pdf2Element.addEventListener("scroll", syncScroll);

      return () => {
         if (pdf1Element) pdf1Element.removeEventListener("scroll", syncScroll);
         if (pdf2Element) pdf2Element.removeEventListener("scroll", syncScroll);
      };
   }, [isLoaded, currentPage]);

   return (
      <div className="w-full h-screen  flex overflow-hidden">
         <div className="flex flex-col w-[80%] h-full">
            <div className="p-5">
               <img
                  src={entvin_logo}
                  className="w-[137px] h-[61px]"
                  alt="icon"
               />
               <div className="text-2xl font-semibold py-3">
                  {"SCEMBLIX"} - Product Label/ Insert Change
               </div>
            </div>
            <div className="flex flex-col md:flex-row px-5  h-full overflow-auto  md:overflow-hidden w-full mx-auto">
               <div className="w-full md:w-1/2 h-[92%]">
                  <h2 className="text-lg bg-[#F5F4FE] gap-4 flex items-center justify-center border font-semibold p-2 text-[#7F56D9] ">
                     {"SCEMBLIX"} - (New){" "}
                     <svg
                        onClick={() => {
                           window.open(NewPdfUrl, "_blank");
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        height="19px"
                        viewBox="0 -960 960 960"
                        width="19px"
                        fill="#7F56D9"
                        className="cursor-pointer"
                     >
                        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
                     </svg>
                  </h2>
                  <div className="border border-gray-300 w-full h-full">
                     <PDFViewer
                        scrollRef={pdf1Ref}
                        url={NewPdfUrl}
                        type={"new"}
                        onLoadSuccess={handleLoadSuccess}
                        numPages={numPages}
                        setNumPages={setNumPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setHighestPageNumber={setHighestPageNumber}
                        highestPageNumber={highestPageNumber}
                     />
                  </div>
               </div>
               <div className="w-full md:w-1/2 h-[92%]">
                  <h2 className="text-lg bg-[#F5F4FE] gap-4 flex items-center justify-center border font-semibold p-2 text-[#7F56D9] ">
                     {"SCEMBLIX"} - (Old)
                     <svg
                        onClick={() => {
                           window.open(OldPdfUrl, "_blank");
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        height="19px"
                        viewBox="0 -960 960 960"
                        width="19px"
                        fill="#7F56D9"
                        className="cursor-pointer"
                     >
                        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
                     </svg>
                  </h2>
                  <div className="border border-gray-300 w-full h-full">
                     <PDFViewer
                        scrollRef={pdf2Ref}
                        url={OldPdfUrl}
                        type={"old"}
                        onLoadSuccess={handleLoadSuccess}
                        numPages={numPages}
                        setNumPages={setNumPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setHighestPageNumber={setHighestPageNumber}
                        highestPageNumber={highestPageNumber}
                     />
                  </div>
               </div>
            </div>
            <div className="w-full p-5 border-t flex items-center justify-center space-x-4">
               <Button
                  onClick={goToPreviousChange}
                  variant="outlined"
                  disabled={currentPage <= sectionChanges[0]?.page}
                  className="!border-[#7F56D9] disabled:!border-gray-600 disabled:!bg-gray-200 disabled:!text-[#929292] !text-[#7F56D9] hover:!text-[#7F56D9]"
               >
                  ← Previous Change
               </Button>
               <Button
                  onClick={goToNextChange}
                  variant="contained"
                  className="!bg-[#7F56D9] disabled:!bg-[#000]/20 hover:!bg-[#7F56D9] hover:!text-white text-white"
                  disabled={currentPage >= sectionChanges[sectionChanges?.length - 1]?.page}
               >
                  Next Change →
               </Button>
            </div>
         </div>
         <div className="p-5 h-screen overflow-y-auto border-r border w-[20%]">
            <div className="py-16"></div>
            <Box sx={{ width: "100%", maxWidth: 360 }}>
               <Typography
                  component="div"
                  sx={{ p: 1, fontSize: 20, fontWeight: 500 }}
               >
                  Section with Changes
               </Typography>
               <List>
                  {sectionChanges.map((section, index) => (
                     <div
                        key={index}
                        onClick={() => {
                           scrollToPage(section.page);
                        }}
                        className={`w-full cursor-pointer ${
                           currentPage === section?.page && "bg-[#7F56D9] text-white"
                        } p-2 border py-3 text-[#4D4D4D] font-normal text-sm`}
                     >
                        {section?.section_title}
                     </div>
                  ))}
               </List>
            </Box>
         </div>
      </div>
   );
};

export default ChemicalChangePage;