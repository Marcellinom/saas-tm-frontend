const fetcher = (url: string) =>
    fetch(`${process.env.NEXT_PUBLIC_TENANT_MANAGEMENT_API}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      return res.json()
    })
    .then(res => res.data)
    .catch((error) => {
      console.error("Error:", error);
    });

export default fetcher;
