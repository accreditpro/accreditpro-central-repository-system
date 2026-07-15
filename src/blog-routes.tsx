import { Routes, Route } from 'react-router-dom';

const BlogPlaceholder = () => <div />;

const BlogRoutes = () => (
  <Routes>
    <Route path="/" element={<BlogPlaceholder />} />
    <Route path="/:slug" element={<BlogPlaceholder />} />
  </Routes>
);

export default BlogRoutes;